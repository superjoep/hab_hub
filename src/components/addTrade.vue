<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
const yourItems = ref([]);
const input_yourFurniName = ref("");
const input_yourFurniamount = ref(0);
const input_yourFurniURL = ref("");
const userState = ref({});
const otherItems = ref([]);
const input_otherFurniName = ref("");
const input_otherFurniamount = ref(0);
const input_otherFurniURL = ref("");
//const input_otherFurniURL = ref("");
const yourtotalValue = ref(0);
const othersTotalValue = ref(0);
const habLoaded = ref();
const habVerify = ref();
const isVerified = ref(false);

onMounted(async () => {
  await loadUser();
});
const Verify = async () => {
  try {
    const response = await axios.get(
      "https://origins.habbo.com/api/public/users",
      {
        params: {
          name: habName.value,
        },
      }
    );
    habVerify.value = response.data;
    if (habVerify.value.motto == "habhub") {
      console.log(habName.value + userState.value.discID);
      alert("Habbo username successfully verified!");

      await axios.post(
        "https://backend-empty-wildflower-8995.fly.dev/user/verify",
        {
          habName: habName.value,
          discID: userState.value.discID,
        }
      );
      isVerified.value = true;
    } else {
      alert("Cant verify habbo user, check your motto/username!");
      isVerified.value = false;
    }
    console.log(isVerified.value);
  } catch (error) {
    alert("Cant verify habbo user, check your motto/username!");
    console.log("failed to get user");
  }
  await loadUser();
};
const checkHabbo = async () => {
  try {
    const response = await axios.get(
      "https://origins.habbo.com/api/public/users",
      {
        params: {
          name: userState.value.habName,
        },
      }
    );
    habLoaded.value = response.data;
    console.log(habLoaded.value + "user value");
  } catch (error) {
    console.log("something went wrong");
  }
};
const loadUser = async () => {
  try {
    const response = await axios.get(
      "https://backend-empty-wildflower-8995.fly.dev/user/me",
      {
        withCredentials: true,
      }
    );
    userState.value = response.data;
  } catch (error) {
    console.error("Error loading user:", error.message);
  }
};

const deleteYourFurni = (name, amount) => {
  const value = getItemValue(name, amount);
  yourtotalValue.value = yourtotalValue.value - value;
  const index = yourItems.value.findIndex((item) => item.Item === name);
  yourItems.value.splice(index, 1);
};
const deleteTheirFurni = (name, amount) => {
  const value = getItemValue(name, amount);
  othersTotalValue.value = othersTotalValue.value - value;
  const index = otherItems.value.findIndex((item) => item.Item === name);
  otherItems.value.splice(index, 1);
};
const addYours = async () => {
  if (input_yourFurniamount.value != 0 && input_yourFurniName.value != "") {
    const isTrue = yourItems.value.some(
      (e) => e.Item === input_yourFurniName.value
    );
    input_yourFurniURL.value = Itemtypes.value.find(
      (name) => name.name == input_yourFurniName.value
    );
    console.log(input_yourFurniURL.value.image);
    if (isTrue != true) {
      yourItems.value.push({
        id: Math.floor(Math.random() * 1000),
        Amount: input_yourFurniamount.value,
        Item: input_yourFurniName.value,
        Image: input_yourFurniURL.value.image,
        Value: getItemValue(
          input_yourFurniName.value,
          input_yourFurniamount.value
        ),
      });
    } else {
      let item = yourItems.value.find(
        (item) => item.Item === input_yourFurniName.value
      );
      if (item) {
        item.Amount += parseInt(input_yourFurniamount.value, 10);
      } else {
        console.log("Item not found to update");
      }
    }
    yourtotalValue.value =
      yourtotalValue.value +
      getItemValue(input_yourFurniName.value, input_yourFurniamount.value);
    console.log(othersTotalValue.value);
  } else {
    alert("Make sure to fill in the item field!");
  }
};

const habName = ref("");

const addOthers = () => {
  if (input_otherFurniamount.value != 0 && input_otherFurniName.value != "") {
    const isTrue = otherItems.value.some(
      (e) => e.Item === input_otherFurniName.value
    );
    input_otherFurniURL.value = Itemtypes.value.find(
      (name) => name.name == input_otherFurniName.value
    );
    if (isTrue != true) {
      otherItems.value.push({
        id: Math.floor(Math.random() * 1000),
        Amount: input_otherFurniamount.value,
        Item: input_otherFurniName.value,
        Image: input_otherFurniURL.value.image,
        Value: getItemValue(
          input_otherFurniName.value,
          input_otherFurniamount.value
        ),
      });
    } else {
      let item = otherItems.value.find(
        (item) => item.Item === input_otherFurniName.value
      );
      if (item) {
        item.Amount += parseInt(input_otherFurniamount.value, 10);
      } else {
        console.log("Item not found to update");
      }
    }
    othersTotalValue.value =
      othersTotalValue.value +
      getItemValue(input_otherFurniName.value, input_otherFurniamount.value);

    console.log(yourItems.value);
  } else {
    alert("Fill in the item information.");
  }
};
const Totalprofit = ref(0);
const addTrade = async () => {
  await checkHabbo();
  if (
    yourItems.value != "" &&
    otherItems.value != "" &&
    userState.value != null &&
    habLoaded.value != null
  ) {
    Totalprofit.value = yourtotalValue.value - othersTotalValue.value;
    axios
      .post("https://backend-empty-wildflower-8995.fly.dev/api/trade", {
        discName: userState.value.username,
        habName: userState.value.habName,
        yourItems: yourItems.value,
        otherItems: otherItems.value,
        profit: Totalprofit.value,
        Date: Date().toLocaleString(),
      })
      .then((response) => {
        console.log("Trade added:", response.data);
        window.location.reload();
      })
      .catch((error) => {
        console.error("There was an error adding the trade:", error);
      });
  } else if (yourItems.value == "" || otherItems.value == "") {
    alert("Input is missing");
  } else {
    alert("Habbo cannot be found");
  }
};

const getItemValue = (itemName, itemAmount) => {
  const item = Itemtypes.value.find((item) => item.name === itemName);
  return item ? itemAmount * item.hc_val : 0;
};

const Itemtypes = ref([]);
const fetchItems = async () => {
  try {
    const response = await axios.get("https://tc-api.serversia.com/items");
    Itemtypes.value = response.data;
  } catch (error) {
    console.error("There was an error fetching the trades:", error);
  }
};

onMounted(fetchItems);
</script>
<template>
  <img src="../../public/habhubLogo.gif" class="w-2/12 mx-auto mt-5" />
  <div
    class="grid grid-cols-1 gap-4 m-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-10 lg:m-5 text-gray-300 place-items-center"
  >
    <!-- Your Items Section -->
    <div
      class="col-span-1 sm:col-span-2 lg:col-span-4 bg-gray-800 rounded-lg border-2 border-gray-700 p-4 w-full"
    >
      <div class="mb-2 text-lg font-semibold text-center">Your Items:</div>
      <ul class="mb-4 space-y-2">
        <li
          v-for="myItem in yourItems"
          :key="myItem.Item"
          class="flex items-center justify-between p-2 bg-gray-700 rounded"
        >
          <span>{{ myItem.Amount }}x {{ myItem.Item }}</span>
          <button
            @click="deleteYourFurni(myItem.Item, myItem.Amount)"
            class="ml-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg px-2"
          >
            X
          </button>
        </li>
      </ul>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label
            for="HeadlineAct"
            class="block text-sm font-medium text-gray-300"
          >
            Furni:
          </label>
          <select
            class="mt-1.5 w-full h-8 rounded-lg bg-gray-700 border-gray-600 text-gray-200 sm:text-sm"
            v-model="input_yourFurniName"
          >
            <option v-for="Item in Itemtypes" :key="Item.id" :value="Item.name">
              {{ Item.name }}
            </option>
          </select>
        </div>
        <div>
          <label
            for="HeadlineAct"
            class="block text-sm font-medium text-gray-300"
          >
            Amount:
          </label>
          <input
            class="mt-1.5 pl-2 w-full h-8 rounded-lg bg-gray-700 border-gray-600 text-gray-200 sm:text-sm"
            v-model="input_yourFurniamount"
            type="number"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="addYours()"
            class="w-full py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            Add
          </button>
        </div>
      </div>
    </div>

    <!-- Profit and User Information Section -->
    <div
      class="col-span-1 sm:col-span-2 lg:col-span-2 text-center space-y-4 mt-4 sm:mt-0"
    >
      <div class="text-lg font-semibold">
        Your profit:
        {{ Math.round((othersTotalValue - yourtotalValue) * 100) / 100 }} HC
      </div>
      <div class="text-md">
        {{ Math.round(yourtotalValue * 100) / 100 }} HC For
        {{ Math.round(othersTotalValue * 100) / 100 }} HC
      </div>
      <div :key="userState.habName" v-if="userState.habName != null">
        Welcome, {{ userState.habName }}
      </div>
      <div v-else-if="userState.discID != null">
        <div
          id="habName"
          class="grid grid-cols-2 gap-2 place-items-center mt-4 sm:mt-0"
        >
          <div class="">Habbo IGN:</div>
          <div>
            <input
              v-model="habName"
              class="w-full h-8 pl-2 rounded-lg bg-gray-700 border-gray-600 text-gray-200"
              type="text"
            />
          </div>
        </div>

        <div class="text-xs">
          You can verify your habbo by adding 'habhub' in your motto and
          pressing the verify button.
        </div>
        <a
          id="verifyButton"
          @click="Verify()"
          class="py-2 px-4 text-white bg-blue-800 hover:bg-blue-900 rounded-lg w-full block sm:inline-block mt-2 sm:mt-0"
        >
          Verify Habbo
        </a>
      </div>

      <div class="mt-4">
        <a
          v-if="!userState.discID"
          href="https://backend-empty-wildflower-8995.fly.dev/auth/discord"
          type="button"
          id="loginBtn"
          class="py-2 px-4 text-white bg-green-600 hover:bg-green-700 rounded-lg w-full block sm:inline-block"
          value="Login"
          >Login with Discord</a
        >

        <a
          v-if="userState.habName"
          id="addButton"
          @click="addTrade"
          class="py-2 px-4 text-white bg-green-600 hover:bg-green-700 rounded-lg w-full block sm:inline-block mt-2 sm:mt-0"
          value="Add Trade"
        >
          Add Trade
        </a>
      </div>
    </div>

    <!-- Others Items Section -->
    <div
      class="col-span-1 sm:col-span-2 lg:col-span-4 bg-gray-800 rounded-lg border-2 border-gray-700 p-4 w-full mt-4 sm:mt-0"
    >
      <div class="mb-2 text-lg font-semibold text-center">Others Items:</div>
      <ul class="mb-4 space-y-2">
        <li
          v-for="otherItem in otherItems"
          :key="otherItem.name"
          class="flex items-center justify-between p-2 bg-gray-700 rounded"
        >
          <span>{{ otherItem.Amount }}x {{ otherItem.Item }}</span>
          <button
            @click="deleteTheirFurni(otherItem.Item, otherItem.Amount)"
            class="ml-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg px-2"
          >
            X
          </button>
        </li>
      </ul>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label
            for="HeadlineAct"
            class="block text-sm font-medium text-gray-300"
          >
            Furni:
          </label>
          <select
            class="w-full h-8 rounded-lg bg-gray-700 border-gray-600 text-gray-200"
            v-model="input_otherFurniName"
          >
            <option v-for="Item in Itemtypes" :key="Item.id" :value="Item.name">
              {{ Item.name }}
            </option>
          </select>
        </div>
        <div>
          <label
            for="HeadlineAct"
            class="block text-sm font-medium text-gray-300"
          >
            Amount:
          </label>
          <input
            class="w-full h-8 pl-2 rounded-lg bg-gray-700 border-gray-600 text-gray-200"
            v-model="input_otherFurniamount"
            type="number"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="addOthers"
            class="w-full py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
