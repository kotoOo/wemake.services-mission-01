const template = `
    <div id="index">
        <h1>Test mission for wemake.services</h1>

        <div id="github-data">
            <template v-if="data.user">
                <div class="user-name">Welcome, {{ data.user.name }}!</div>
                <div class="avatar"><img src="{{ data.user.avatar_url }}" class="av" /></div>

                <ul>
                    <li v-for="(repo, key) of data.repos" :key="key">{{ repo.name }}</li>
                </ul>
            </template>
            <a v-else :href="data.authURL" class="start-auth">Start GitHub authorization</a>
        </div>
    </div>
`;

const index = Vue.component('index-page', {
    template,
    props: {
        data: Object
    }
});

const vm = new Vue({
    
}).$mount("#page");