<template>
    <div class="container bots">
        <div class="row">
            <div class="col-12 col-md-4 col-lg-4 fixed">
                <div class="bots__search-wrapper">
                    <input v-model="search" type="text" class="input bots__search">
                    <span class="bots__search-icon">
                        <img src="../assets/svg/search.svg">
                    </span>
                </div>
                <div class="bots__list">
                    <div v-for="bot in filteredBotList" :key="bot.id">
                        <bot-item :id="bot.botID">{{ bot.title }}&nbsp; ({{ bot.pair.from }} / {{bot.pair.to}})</bot-item>
                    </div>
                </div>
                <div class='bots__button'>
                    <button 
                        @click="onAddNewBot" 
                        class="button button--big button--primary bots__add-button"              
                        >Добавить бота +</button>
                </div>
            </div>
            <div class="col-12 col-md-8 col-lg-8 margin">
                <nuxt-child />
            </div>
        </div>
    </div>
</template>

<script>
import BotItem from '~/components/BotItem';
export default {
    components: {
        BotItem
    },
    computed: {
        filteredBotList() {
            return this.botsList.filter(bot => {
                let a = bot.title ? bot.title : '',
                    b = bot.pair.from ? bot.pair.from : '',
                    c = bot.pair.to ? bot.pair.to : '';
                let string = `${a.toLowerCase()}${b.toLowerCase()}${c.toLowerCase()}`;
                return string.indexOf(this.search.toLowerCase()) >= 0;
            })
        },
        botsList() {
            return this.$store.getters.getBotsList
        },
        maxBotAmount() {
            return this.$store.getters.getMaxBotAmount;
        },
        currentBotsAmount() {
            return this.$store.getters.getCurrentBotsAmount;
        }
    },
    data() {
        return {
            search: ''
        }
    },
    watch: {
        '$route'() {
            this.$store.commit('setСonfigurationProcess', false);
        }
    },
    methods: {
        onAddNewBot() {
            let botAmount = this.botsList.length,
                binanceStatus = this.$store.getters.getBinanceAPIStatus,
                amountB = (this.currentBotsAmount < this.maxBotAmount);
            console.log(botAmount, this.maxBotAmount)
            if(binanceStatus &&  amountB) {
                this.$router.push('/Bots/New');
            } else {
                this.$store.commit('setStatus', 'info');
                if(!binanceStatus) {
                    this.$store.commit('setMessage', `Ключи бинанс не заданы`);
                } else if(!amountB) {
                    this.$store.commit('setMessage', `Достигнуто максимальное количество ботов, которое вы можете создать`);
                }
            }
        }
    },
    created() {
    }
}
</script>

<style>

/* .bots {
    position: relative;
} */

.fixed {
    position: fixed;
    max-width: 33.3333333%;
}

.margin {
    margin-left: 400px;
}

@media screen and (max-width: 768px) {
    .fixed {
        position: static;
        width: 100%;
        max-width: 100%;
    }

    .margin {
        margin-left: 0px;
    }

    .bots__add-button {
        padding-bottom: 15px; 
    }
}

@media screen and (min-width: 1240px) {
    .fixed {
        position: fixed;
        width: 25%;
        max-width: 25%;
    }

    .margin {
        margin-left: 400px;
    }
}

.bots__list {
    height: 80vh;
    max-height: 70vh;
    overflow-y: auto;
}

</style>
