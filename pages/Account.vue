<template>
    <div class="container account">
        <div class="row">
            <div class="col-12 col-md-6 col-lg-4 border-right">
                <div class="account__menu">
                    <!-- <div class="account__menu-item">
                        Баланс: 0.124 BTC
                        <nuxt-link to="/Account/Balans" class="account__menu-link">Пополнить</nuxt-link>
                    </div> -->
                    <div class="account__menu-item">
                        Тариф: {{ userTariffs.length ? userTariffs[0].title : 'Не задано' }}
                        <nuxt-link 
                            to="/Account/Tariff" 
                            class="account__menu-link">Изменить</nuxt-link>
                    </div>
                
                    <div class="account__menu-item">
                        Ключи Binance: {{ getBinance ? 'задано' : 'не задано' }} 
                        <nuxt-link 
                            to="/Account/Binans" 
                            class="account__menu-link">{{ getBinance ? 'Изменить' : 'Задать' }}</nuxt-link>
                    </div>

                    <div class="account__menu-item">
                        Баланс: {{ walletBalance ? fixed(walletBalance, 8) : 0 }} 
                        <nuxt-link 
                            to="/Account/Balance"
                            class="account__menu-link">Пополнить</nuxt-link>
                    </div>

                </div>
                <nuxt-link 
                    to="/Account/Settings" 
                    tag="button" 
                    class="button button--primary account__button">Изменить пароль</nuxt-link>
            </div>
            <div class="col-12 col-md-6 col-lg-8">
                <nuxt-child :tariffs="userTariffs" :tariffsHistory="userTariffsHistory" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            userTariffs: [],
            userTariffsHistory: [],
            walletBalance: ''
        }
    },
    computed: {
        getBinance() {
            return this.$store.getters.getBinanceAPIStatus;
        }
    },
    methods: {
        fixed(num = 0, dim = 0) {
            num = Number(num).toFixed(dim);
            return Number(num);
        },
        getCurrentTariff () {
            this.$axios.$get('/api/user/getUsersTariffs')
                .then(res => {
                    if(res.status === 'ok') {
                        this.userTariffs = res.data.userTariffs.length ? res.data.userTariffs : [];
                        this.userTariffsHistory = res.data.userTariffsHistory.length ? res.data.userTariffsHistory : [];
                    } else {
                        console.log(res);
                    }
                })
        }
    },
    created() {
        this.getCurrentTariff();
        this.$axios
            .$get('/api/account/balance/getUserWalletInfo')
            .then(res => {
                this.walletBalance = res.data.walletBalance;
                this.$store.commit('setWalletAddress', res.data.walletAddress);
            })
            .catch(error => console.log(error))
    }
}
</script>


<style>
.account__menu-item {
    font-size: 2rem;
    line-height: 2.3rem;
    font-weight: 700;
}

.account__menu-item:not(:last-child) {
    margin-bottom: 1.4rem
}

.account__menu-link {
    display: inline-block;
    margin-left: .7rem;
    font-size: 1.4rem;
    line-height: 1.6rem;
    text-decoration: underline;
    color: inherit;
}

.account__button {
    display: block;
    margin-top: 7.4rem;
    padding: 2rem 5rem;
    color: #000;
    margin-bottom: 4rem;
}
</style>

