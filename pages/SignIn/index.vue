<template>
    <form @submit.prevent="onSignIn" class="absolute-center auth-form">
        <h1 class="title title--big text-center auth-form__title">Вход</h1>
        <input v-model="email" type="email" class="input auth-form__input" placeholder="Email">
        <input v-model="password" type="password" class="input auth-form__input" placeholder="Пароль">
        <div class="d-flex">
            <button :class="{'button--disabled': !isFormValid}" :disabled="!isFormValid" type="submit" class="button button--success auth-form__button">Войти</button>
        </div>
        <div class="d-flex">
            <!-- <span class="auth-form__forgot-password">Забыли пароль?</span> -->
            <p class="auth-form__not-have-account"><nuxt-link to="/Registration" class="link">Регистрация</nuxt-link></p>
        </div>
    </form>
</template>

<script>
    export default {
        data() {
            return {
                email: '',
                password: ''
            }
        },
        computed: {
            isFormValid() {
                return this.email.length !== 0
                        & this.password.length !== 0
            }
        },

        methods: {
            onSignIn() {
                this.$store.commit('setSpiner', true)
                this.$axios.$post('/api/signin', {
                    email: this.email,
                    password: this.password
                })
                .then(res => {
                    if(res.status === 'ok') {
                        this.$store.dispatch('setAuthorizedStatus', true)
                        this.$store.commit('setSpiner', false)
                        this.$store.commit('setEmail', res.data.email); 
                        this.$store.commit('setMaxBotAmount', res.data.maxBotAmount);
                        this.$router.push('/Bots');
                        this.$store.dispatch('getUserData');
                    } else {
                        this.$store.commit('setSpiner', false);
                        this.$store.commit('setStatus', 'error');
                        this.$store.commit('setMessage', res.message);
                        console.log(res.message)
                    }
                })
                .catch(e => {
                    this.$store.commit('setSpiner', false);
                })
            }
        },
        created() {
            if(this.$router.history.current.query.Auth) {
                this.$store.commit('setStatus', 'ok');
                this.$store.commit('setMessage', "Активация прошла успешно!");
            }
        }
    }
</script>
