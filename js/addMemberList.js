async function addMemberList(guild, shard) {
    let listDiv = document.getElementById("memberBar");

    // Clear members list
    listDiv.innerHTML = '';

    // Loop through roles
    let roles = (await shard.eval(`this.guilds.get('${guild.id}').roles.map(r => r)`))
        .filter(r => r.hoist) // Check if it is a displayed role
        .sort((r1, r2) => r2.position - r1.position); // Sort by highest to lowest rank

    roles.forEach(async r => { // Loop through
        let memberCount = await shard.eval(`this.guilds.get('${guild.id}').roles.get('${r.id}').members.filter(m => (m.hoistRole && m.hoistRole.id == r.id && m.presence.status != 'offline')).size`);

        if (memberCount) {
            // Role container
            let container = document.createElement("div");
            container.id = r.id;
            container.classList.add("roleContainer");
            listDiv.appendChild(container);

            // Add the role name
            let name = document.createElement("span");
            name.classList.add("roleTitle");
            name.innerText = r.name;
            container.appendChild(name);
            
            // Add each user
            r.members
                .filter(m => (m.hoistRole && m.hoistRole.id == r.id && m.presence.status != 'offline'))
                .sort((m1, m2) => m1.id - m2.id)
                .forEach(m => {
                    // Make the div for the user
                    let userDiv = document.createElement("div");
                    userDiv.id = m.id;
                    userDiv.classList.add('mLUserDiv');
                    container.appendChild(userDiv);

                    // Add the user icon
                    let icon = document.createElement("img");
                    icon.src = m.user.avatarURL ? m.user.avatarURL.replace(/(size=)(\d+)/gi, "$164") : "resources/images/default.png";
                    icon.classList.add('mLIcon');
                    userDiv.appendChild(icon);

                    // Make the username text
                    let username = document.createElement("p");
                    username.classList.add("mLUsername");
                    let name = m.nickname || m.user.username;
                    if (name.length > 15) {
                        name = `${name.substring(0, 15)}...`
                    }
                    username.innerText = name;
                    username.style.color = m.displayHexColor || "#8E9297";
                    userDiv.appendChild(username);
                });
            }
        });

    let onlineCount = guild.members.filter(m => (m.presence.status != 'offline' && m.hoistRole == null)).size;
    if (onlineCount) {
        // Create offline label text
        let container = document.createElement("div");
        container.id = 'onlineUserList';
        container.classList.add("roleContainer");
        listDiv.appendChild(container);

        let name = document.createElement("span");
        name.classList.add("roleTitle");
        name.innerText = 'online';
        container.appendChild(name);

        // Show online users
        guild.members
            .filter(m => m.presence.status != 'offline' && m.hoistRole == null)
            .sort((m1, m2) => m1.id - m2.id)
            .forEach(m => {
                // Make the div for the user
                let userDiv = document.createElement("div");
                userDiv.id = m.id;
                userDiv.classList.add('mLUserDiv');
                container.appendChild(userDiv);

                // Add the user icon
                let icon = document.createElement("img");
                icon.src = m.user.avatarURL ? m.user.avatarURL.replace(/(size=)(\d+)/gi, "$164") : "resources/images/default.png";
                icon.classList.add('mLIcon');
                userDiv.appendChild(icon);

                // Make the username text
                let username = document.createElement("p");
                username.classList.add("mLUsername");
                username.innerText = m.nickname || m.user.username;
                username.style.color = (m.displayColor == 0) ? "#8E9297" : m.displayHexColor;
                userDiv.appendChild(username);
            });
    }

    let offline = [];

    // Display the offline users
    let offlineCount = guild.members.filter(m => (m.presence.status == 'offline')).size;
    if (offlineCount) {
        // Create offline label text
        let container = document.createElement("div");
        container.id = 'offlineUserList';
        container.classList.add("roleContainer");
        listDiv.appendChild(container);

        let name = document.createElement("span");
        name.classList.add("roleTitle");
        name.innerText = 'offline';
        container.appendChild(name);

        // Show offline users
        guild.members
            .filter(m => m.presence.status == 'offline')
            .sort((m1, m2) => m1.id - m2.id)
            .forEach(m => {
                offline.push(m.user.id);
                // Make the div for the user
                let userDiv = document.createElement("div");
                userDiv.id = m.id;
                userDiv.classList.add('mLUserDivOffline');
                userDiv.classList.add('mLUserDiv');
                container.appendChild(userDiv);

                // Add the user icon
                let icon = document.createElement("img");
                icon.src = m.user.avatarURL ? m.user.avatarURL.replace(/(size=)\d+?($| )/, '$164') : "resources/images/default.png";
                icon.classList.add('mLIcon');
                userDiv.appendChild(icon);

                // Make the username text
                let username = document.createElement("p");
                username.classList.add("mLUsername");
                username.innerText = m.displayName || m.user.username;
                username.style.color = (m.displayColor == 0) ? "#8E9297" : m.displayHexColor;
                userDiv.appendChild(username);
            });
    }

    // Display the unsorted, online users
    guild.fetchMembers().then(promiseGuild => {
        let members = promiseGuild.members.array();
        // Display the other unshown users users
        let offlineCount = members.filter(m => (m.presence.status == 'offline' && !offline.includes(m.user.id))).length;
        if (offlineCount) {
            // Create offline label text
            let container = document.createElement("div");
            container.id = 'offlineUserList';
            container.classList.add("roleContainer");
            listDiv.appendChild(container);

            let name = document.createElement("span");
            name.classList.add("roleTitle");
            name.innerText = 'uncached users';
            container.appendChild(name);

            // Show offline users
            members
                .filter(m => m.presence.status == 'offline' && !offline.includes(m.user.id))
                .sort((m1, m2) => m1.id - m2.id)
                .forEach(m => {
                    // Make the div for the user
                    let userDiv = document.createElement("div");
                    userDiv.id = m.id;
                    userDiv.classList.add('mLUserDivOffline');
                    userDiv.classList.add('mLUserDiv');
                    container.appendChild(userDiv);

                    // Add the user icon
                    let icon = document.createElement("img");
                    icon.src = m.user.avatarURL ? m.user.avatarURL.replace(/(size=)\d+?($| )/, '$164') : "resources/images/default.png";
                    icon.classList.add('mLIcon');
                    userDiv.appendChild(icon);

                    // Make the username text
                    let username = document.createElement("p");
                    username.classList.add("mLUsername");
                    username.innerText = m.displayName || m.user.username;
                    username.style.color = (m.displayColor == 0) ? "#8E9297" : m.displayHexColor;
                    userDiv.appendChild(username);
                });
        }
    });
};