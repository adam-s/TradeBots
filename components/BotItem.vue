<template>
    <nuxt-link :to="'/Bots/' + id" class="bot">
        <div class="bot__state" :class="{'bot__state--manual': isBotManual}"></div>
        <div class="bot__name"><slot></slot></div>
        <div v-show="isBotHasOrders" class="bot__status"><img src="~/assets/svg/market.svg"></div>
        <div class="bot__signal" :class="{'bot__signal--disabled' : !isBotActive, 'bot__signal--freeze' : isBotFreeze}"></div>
    </nuxt-link>
</template>

<script>
    export default {
        props: {
            id: {
                type: String,
                required: true,
                default: 'New'//'add-new'
            }
        },
        computed: {
            bot() {
                return this.$store.getters.getBot(this.id)
            },
            isBotManual() {
                return this.bot.state === '1'
            },
            isBotHasOrders() {
                // return false;
                let a = Object.keys(this.bot.processes).length;
                if(a) {
                    let b = 0;
                    for (let proc in this.bot.processes) {
                        let b1 = this.bot.processes[proc].orders.length;
                        if(b1) {
                            let b = this.bot.processes[proc].orders.filter(order => order && (order.status === 'NEW' || order.status === 'PARTIALLY_FILLED')).length;
                            if(b) {
                                return true;
                            } 
                        }
                    }
                    return b ? true : false;
                }
                else {
                    return false;
                }

                return this.bot.orders.length &&
                        this.bot.orders.filter(order => order && (order.status === 'NEW' || order.status === 'PARTIALLY_FILLED')).length
            },
            isBotActive() {
                if(this.id) {
                    return this.bot.status === true
                }
            },
            isBotFreeze() {
                if(this.id) {
                    return this.bot.freeze === '1'
                }
            }
        }
    }
</script>

<style scoped>
a.nuxt-link-exact-active {
    background-color: #DCDCDC !important; 
}

.bot {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #F1F1F1;
    color: var(--color-primary);
    padding: 2rem 4rem;
    font-size: 1.8rem;
    line-height: 2.1rem;
    cursor: pointer;
    margin-bottom: .6rem;
    transition: .3s all ease
}

.bot__state {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 5px;
    height: 100%;
    background-color: rgba(255, 82, 0, .3);;
}

.bot__state--manual {
    background-color: rgba(0, 39, 255, .3);
}

.bot:hover {
    background-color: #DCDCDC;
}

.bot__status {
    position: absolute;
    top: 50%;
    left: 75%;
    transform: translateY(-50%)
}

.bot__signal {
    width: 1.7rem;
    height: 1.7rem;
    background-color: #72C770;
    border-radius: 100%
}

.bot__name {
    width: 100%;
    max-width: 215px;
}

.bot__signal--disabled {
    background-color: inherit;
}

.bot__signal--freeze {
    background-color: #74b9ff;
}
</style>

