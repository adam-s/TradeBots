<template>
    <header class="header">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <nav class="nav">
                        <div v-if="isAuth" class="nav__left">
                            <nuxt-link to="/Bots" class="nav__link">Боты</nuxt-link>
                            <nuxt-link to="/Statistics" class="nav__link">Статистика</nuxt-link>
                            <nuxt-link to="/Income" class="nav__link">Доход</nuxt-link>
                            <nuxt-link to="/Account" class="nav__link">Аккаунт</nuxt-link>

                            <div v-for="page in pagesSlug" :key="'/pages' + page.pageId">
                                <nuxt-link  
                                    class="nav__link new_pages"
                                    :to="page.slug"    
                                >{{ page.title }}</nuxt-link>
                            </div>


                        </div>
                        <div class="nav__right">
                            <p v-if="isAuth" class="nav__link nav__accaunt">{{currentBotsAmount}}/{{maxBotAmount}}</p>
                            <p v-if="isAuth" class="nav__link nav__accaunt" :class="{'varning_red': !binanceStatus}">{{ email }}{{ !binanceStatus ? ' (ключи бинанс не заданы!)' : '' }}</p>
                            <button 
                                v-if="isAuth" 
                                @click.prevent="onSignOut" 
                                class="nav__link btn__signout">Выйти</button>
                            <!-- <button 
                                v-else
                                @click.prevent="onSignIn"
                                class="nav__link btn__signout">Войти</button> -->
                        </div>
                    </nav>
                </div>
            </div>
        </div>
    </header>
</template>

<script>
    export default {
        computed: {
            currentBotsAmount() {
                return this.$store.getters.getCurrentBotsAmount;
            },
            maxBotAmount() {
                return this.$store.getters.getMaxBotAmount;
            },
            isAuth() {
                return this.$store.getters.getAuthorizedStatus;
            },
            email() {
                return this.$store.getters.getEmail;
            },
            binanceStatus() {
                return this.$store.getters.getBinanceAPIStatus;
            },
            maxBotAmount() {
                return this.$store.getters.getMaxBotAmount;
            },
            pagesSlug() {
                let pages = this.$store.getters.getPagesList,
                    ret = [];

                pages.forEach(page => {
                    ret.push({
                        pageId: page.pageId,
                        slug: `/pages?page=${page.slug}`,
                        title: page.title
                    });
                });

                return ret;
            }
        },
        methods: {
            onSignIn() {
                this.$router.push('/SignIn')
            },
            onSignOut() {
                // this.$store.commit('setSpiner', true);
                this.$axios.$get('/api/signout')
                    .then(res => {
                        if(res.status === 'ok') {
                            this.$router.push('/Registration')
                            // this.$store.commit('setSpiner', false);
                            this.$store.dispatch('setAuthorizedStatus', false)
                            this.$store.commit('setEmail', '');
                        } else {
                            alert(res.message)
                            // this.$store.commit('setSpiner', false);
                        }
                    })
                    .catch(e => console.log(e))
            }
        },
        created() {
            this.$store.dispatch('getUserData');
            // this.$store.dispatch('getPagesList');
            // this.$store.dispatch('getUserPayments');
            // this.$store.dispatch('setEmail');
            // this.$store.dispatch('setBotsList');
            // this.$store.dispatch('getSymbolsList');
            // // this.$store.dispatch('firstGetBinanceAPI');
            // this.$store.dispatch('getUserStatistics');
            // this.$store.dispatch('getUserMaxBotAmount');
            // this.$store.dispatch('firstGetBinanceAPI');
            // // this.$store.dispatch('checkBinance');
        }
    }
</script>

<style>
.header {
    max-height: 7rem;
    height: 100%;
    background-color: #EFEFEF;
    padding: 2rem 0;
    margin-bottom: 2rem;
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    z-index: 9999;
}

.nav {
    display: flex;
    width: 100%;
    justify-content: space-between
}

.nav__left {
    display: flex;
    flex-wrap: wrap;
}

.nav__link {
    display: block;
    font-size: 1.8rem;
    line-height: 2.1rem;
    font-weight: 700;
    color: inherit;
    text-decoration: none
}

.nav__link:not(:last-child) {
    margin-right: 2rem
}

.nuxt-link-active {
    color: #2B68E0;
}

.btn__signout {
    outline: none;
    font-size: inherit;
    display: block;
    background-color: transparent;
    border: none;
    cursor: pointer;
}

.nav__right {
    display: flex;
    margin-left: auto
}

.nav__accaunt {
    cursor: default;
    color: darkslateblue;
}

.varning_red {
    color: red !important;
}

.new_pages {
    padding: 0 1rem 0 1rem;
}
</style>
