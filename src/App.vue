<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'app',
  mounted()
  {
    // this.$store.dispatch('register')
  },
  watch:
  {
    '$route'(to)
    {
      document.title = 'CHPT中華精測' + (to.meta.title || '' )
    },
  },
}
</script>

<style>
#app
{
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微軟雅黑",Arial,sans-serif;
  font-size: 24px;
}
</style>
