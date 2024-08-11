<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
const userState = ref(null);
// Define reactive state variables
const trades = ref([]);
const orderDir = ref("Newly listed"); // Initialize with a default value
const selectedItem = ref("All");
const userName = ref("");
const habOnline = ref({});
onMounted(async () => {
  await getUsername();
});
// Fetch user data
const loadHabboOnline = async (habName) => {
  console.log(habName);
  try {
    const response = await axios.get(
      "https://origins.habbo.com/api/public/users",
      {
        params: {
          name: habName,
        },
      }
    );
    habOnline.value[habName] = response.data.online;
  } catch (error) {
    console.log("error");
  }
  console.log(habOnline.value[habName]);
  return;
};
const deleteYourTrade = async (id) => {
  console.log(id);
  try {
    await axios
      .post("https://backend-empty-wildflower-8995.fly.dev/api/trade/delete", {
        _id: id,
      })
      .then((response) => {
        console.log(response);
        fetchTrades();
      });
  } catch (error) {
    console.log("error deleting trade");
  }
};
// Fetch trades data from the backend API
const fetchTrades = async () => {
  try {
    const response = await axios.get(
      "https://backend-empty-wildflower-8995.fly.dev/api/trade"
    );
    trades.value = response.data;
    for (const trade of trades.value) {
      loadHabboOnline(trade.habName);
    }
  } catch (error) {
    console.error("There was an error fetching the trades:", error);
  }
};
const getUsername = async () => {
  try {
    const response = await axios.get(
      "https://backend-empty-wildflower-8995.fly.dev/user/me",
      {
        withCredentials: true,
      }
    );
    userState.value = response.data;
    userName.value = userState.value.username;
    console.log(userName.value);
  } catch (error) {
    console.error("Error loading user:", error.message);
  }
};
// Computed property to filter and sort trades
const filteredAndSorted = computed(() => {
  return trades.value
    .filter((trade) => {
      // Filter by selected item if one is chosen
      if (selectedItem.value !== "All") {
        const hasItem = [...trade.yourItems, ...trade.otherItems].some(
          (item) => item.Item === selectedItem.value
        );
        return hasItem;
      }
      return true;
    })
    .sort((a, b) => {
      if (orderDir.value === "High profit") {
        return b.profit - a.profit; // Sort descending by profit
      } else if (orderDir.value === "Low profit") {
        return a.profit - b.profit; // Sort ascending by profit
      } else {
        return new Date(b.Date) - new Date(a.Date); // Sort by date
      }
    });
});

// Computed property to generate a list of unique items
const findItem = computed(() => {
  const items = new Set();
  trades.value.forEach((trade) => {
    trade.yourItems.forEach((item) => items.add(item.Item));
    trade.otherItems.forEach((item) => items.add(item.Item));
  });
  items.add("All");
  return [...items];
});

// Fetch trades when the component is mounted
onMounted(fetchTrades);
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Filter Section -->
    <div
      class="bg-gray-800 text-gray-300 rounded-xl p-4 w-full max-w-4xl mx-auto"
    >
      <div class="grid grid-cols-5 items-center">
        <div class="font-semibold">Filter:</div>
        <div>
          <select
            class="mt-1 w-full rounded-lg border-gray-700 bg-gray-700 text-gray-300 sm:text-sm"
            v-model="orderDir"
          >
            <option>Newly listed</option>
            <option>High profit</option>
            <option>Low profit</option>
          </select>
          <select
            class="mt-1 w-full rounded-lg border-gray-700 bg-gray-700 text-gray-300 sm:text-sm"
            v-model="selectedItem"
          >
            <option v-for="item in findItem" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>
        <div></div>
        <div></div>
      </div>
    </div>

    <!-- Trades List -->
    <div class="mt-6">
      <div
        v-for="trade in filteredAndSorted"
        :key="trade.id"
        class="bg-gray-800 text-gray-300 rounded-xl p-5 mb-6 w-full max-w-4xl mx-auto"
      >
        <div v-if="trade.discName === userName || userName === 'kaasverslaafd'">
          <div>
            <button
              @click="deleteYourTrade(trade._id)"
              class="ml-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg px-2"
            >
              X
            </button>
          </div>
        </div>
        <div class="grid grid-cols-3 text-center mb-4">
          <div>Discord: {{ trade.discName }}</div>
          <div>Profit: {{ Math.round(trade.profit * 100) / 100 }} HC</div>
          <div>
            Habbo: {{ trade.habName }}
            <div class="text-xs" v-if="!habOnline[trade.habName]">offline</div>
            <div class="text-xs" v-else>online</div>
          </div>
        </div>

        <div class="grid grid-cols-3 text-center">
          <div class="grid grid-cols-3">
            <div
              v-for="item in trade.yourItems"
              :key="'your-item-' + item.id"
              class="text-xs text-white h-20 w-20 bg-gray-700 rounded-lg m-2 flex"
            >
              <div class="pt-14 pl-2 mt-1 absolute">{{ item.Amount }}</div>

              <img class="h-full w-full object-contain p-1" :src="item.Image" />
            </div>
          </div>
          <div class="flex items-center justify-center text-lg font-semibold">
            for your
          </div>
          <div>
            <div class="grid grid-cols-3">
              <div
                v-for="item in trade.otherItems"
                :key="'your-item-' + item.id"
                class="text-xs text-white h-20 w-20 bg-gray-700 rounded-lg m-2 flex"
              >
                <div class="pt-14 pl-2 mt-1 absolute">{{ item.Amount }}</div>

                <img
                  class="h-full w-full object-contain p-1"
                  :src="item.Image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
