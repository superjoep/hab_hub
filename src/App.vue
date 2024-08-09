<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col">
    <addTrade />
    <tradeList />
  </div>
</template>

<script>
import addTrade from "./components/addTrade.vue";
import tradeList from "./components/tradeList.vue";

export default {
  name: "App",
  components: {
    addTrade,
    tradeList,
  },
};
</script>
