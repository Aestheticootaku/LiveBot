function format(text) {
    if (text.length >= 25) {
        return `${text.substring(0, 25)}...`;
    }
    return text;
}

// Selecting new guild
async function guildSelect(g, img, shard) {
    // Update the selected guild
    //document.getElementById('guildIndicator').style.display = 'block';
    if (oldimg)
        oldimg.classList.remove('selectedGuild');
    img.classList.add('selectedGuild');

    // this should be done another way
    document.getElementById('guildIndicator').style.marginTop = `${img.offsetTop - 2}px`;
    document.getElementById('guildIndicator').style.display = "block";

    oldimg = img;

    // Clear the message loop interval
    try {
        clearInterval(memberLoop);
    } catch(err){}

    // Update the member count every 2000 ms
    global.memberLoop = setInterval(async () => {
        document.getElementById('members-count').innerText = await shard.eval(`this.guilds.get('${g.id}').memberCount`);
    }, 2000);
    // Set the count to begin
    document.getElementById('members-count').innerText = g.memberCount;

    // Clear the channels list
    let channelList = document.getElementById("channel-elements");
    while (channelList.firstChild)
        channelList.removeChild(channelList.firstChild);

    // Update guild profile name
    let name = g.name;
    if (g.name.length >= 22)
        name = name.substring(0, 19)+'...';
    document.getElementById('guildName').innerHTML = name;

    // Update guild profile image
    let icon = g.iconURL;
    if (!icon) {
        icon = 'resources/images/default.png';
    }
    document.getElementById('guildImg').src = icon;

    // Create the member list
    addMemberList(g, shard);

    // The parent variable will change, realParent will not
    const realParent = document.getElementById("channel-elements");
    let parent = realParent;
    let categoryParent;

    // Sort the channels and add them to the screen
    (await shard.eval(`this.guilds.get('${g.id}').channels.map(c => c)`))
        .filter(c => c.type == 'category')
        .sort((c1, c2) => c1.position - c2.position)
        .forEach(c => {

            if (c.type == 'category') {
                let category = document.createElement('div');
                category.classList.add("category");
                category.classList.add("open");
                category.id = c.id;
                realParent.appendChild(category);
                
                // Container for the category svg and name
                let nameCategory = document.createElement('div')
                nameCategory.classList.add('categoryNameContainer');
                category.appendChild(nameCategory);
                
                // Create the svg icon
                let svg = document.createElement('img');
                // svg.type = "image/svg+xml";
                // svg.data
                svg.src = './resources/icons/categoryArrow.svg';
                svg.classList.add("categorySVG");
                nameCategory.appendChild(svg);

                // Create the category name
                let text = document.createElement("h5");
                text.classList.add("categoryText");
                text.innerText = format(c.name);
                nameCategory.appendChild(text);

                // Create the container for all the channels
                let div = document.createElement('div');
                div.classList.add('channelContainer');
                category.appendChild(div);

                // Event listener for opening and closing
                nameCategory.addEventListener("click", event => {
                    category.classList.toggle("open");
                });

                
                // Set the parent for the next added channels
                parent = div;
                categoryParent = c;
            }
        });

    (await shard.eval(`this.guilds.get('${g.id}').channels.map(c => c)`))
        .filter(c => c.type != 'category')
        .sort((c1, c2) => c1.position - c2.position)
        .forEach(async c => {
            // At this point, the channel is either text or voice
            let div = document.createElement("div");
            div.classList.add("channel");
            div.classList.add(c.type);
            div.id = c.id;

            // check if user can access the channel
            let blocked = false;
            let hasPerms = await shard.eval(`!this.channels.get(${c.id}).permissionsFor(this.guilds.get('${g.id}').me).has("VIEW_CHANNEL")`);
            if (hasPerms) {
                blocked = true;
                div.classList.add("blocked");
            }

            // Create the svg icon
            let svg = document.createElement('img');
            // svg.type = "image/svg+xml";
            // svg.data
            svg.src = `./resources/icons/${c.type}Channel${blocked ? 'Blocked' : ''}.svg`;
            svg.classList.add("channelSVG");
            div.appendChild(svg);

            // Add the text
            let channelName = document.createElement('h5');
            channelName.classList.add('viewableText');
            channelName.innerText = format(c.name);
            div.appendChild(channelName);

            // Finally, add it to the parent
            if (c.parentID)
                document.getElementById(c.parentID).getElementsByTagName('div')[1].appendChild(div);
            else
                realParent.insertBefore(div, realParent.querySelector('.category'));


            if (!blocked) {
                div.addEventListener("click", event => {
                    let previous = realParent.querySelector('.selectedChan');
                    let id;
                    if (previous) {
                        id = previous.id;
                        if (id != c.id)
                            previous.classList.remove("selectedChan");
                    }

                    if (id != c.id) {
                        div.classList.add("selectedChan");
                        channelSelect(c, div, shard);
                    }
                });
            }
        });
}