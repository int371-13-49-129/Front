<template>
  <div class="h-full flex flex-col">
    <div class="flex flex-col justify-around">
      <div class="flex justify-between">
        <div class="text-base font-semibold">ผู้รับฟัง</div>
        <div
          @click="$router.push({ name: 'Listener' })"
          class="flex items-center cursor-pointer"
        >
          ทั้งหมด
          <i class="bx bx-chevron-right"></i>
        </div>
      </div>
      <div class="flex mt-2 overflow-x-auto pb-4 border-b-2 border-gray-100">
        <div
          class="flex flex-col items-center w-28 mx-1"
          v-for="ac in allAccountIsListener.accounts"
          :key="ac.account_id"
        >
          <vs-avatar
            class="cursor-pointer flex-shrink-0"
            circle
            @click="toMessage(ac.account_id)"
          >
            <img v-if="ac.image_url" :src="getFile(ac.image_url)" alt="" />
            <i v-else class="bx bx-user"></i>
          </vs-avatar>
          <div
            @click="toMessage(ac.account_id)"
            class="truncate w-28 text-sm text-center cursor-pointer"
          >
            {{ getName(ac) }}
          </div>
        </div>
      </div>
      <div class="text-base font-semibold my-4">History chat</div>
    </div>
    <div class="flex-grow overflow-y-auto scroll">
      <div class="">
        <div
          class="flex my-2 items-center cursor-pointer"
          v-for="messageConnect in allMessageConnect"
          :key="messageConnect.message_connect_id"
          v-show="
            messageConnect.message_connect_status !== 'inactive' ||
            messageConnect.messages.length > 0
          "
          @click="toMessage(getOtherAccount(messageConnect).account_id)"
        >
          <vs-avatar class="flex-shrink-0" circle>
            <img
              v-if="getOtherAccount(messageConnect).image_url"
              :src="getFile(getOtherAccount(messageConnect).image_url)"
              alt=""
            />
            <i v-else class="bx bx-user"></i>
          </vs-avatar>
          <div class="flex-grow truncate ml-4">
            <div class="font-semibold">
              {{ getName(getOtherAccount(messageConnect)) }}
            </div>
            <div
              class="w-full flex text-sm"
              :class="
                (!getLastMessages(messageConnect).is_read &&
                  getLastMessages(messageConnect).account_id !=
                    account.account_id) ||
                messageConnect.message_connect_status == 'waiting'
                  ? 'text-black font-medium'
                  : ' text-gray-400'
              "
            >
              <div
                v-if="messageConnect.message_connect_status == 'waiting'"
                class="mr-2 flex-shrink truncate"
              >
                <span>คำขอส่งข้อความ</span>
              </div>
              <div v-else class="mr-2 flex-shrink truncate">
                <span v-if="getLastMessages(messageConnect).image_url"
                  >ได้ส่งรูปภาพ</span
                >
                <span v-else>{{ getLastMessages(messageConnect).text }}</span>
              </div>
              <div>
                ·
                {{
                  messageConnect.message_connect_status == "waiting"
                    ? getTime(messageConnect.last_messages)
                    : getTime(getLastMessages(messageConnect).createdAt)
                }}
              </div>
            </div>
          </div>
          <div
            v-if="
              !getLastMessages(messageConnect).is_read &&
              getLastMessages(messageConnect).account_id != account.account_id
            "
            class="flex items-center ml-2"
          >
            <i class="bx bxs-circle text-xs text-primary"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import mixin from "@/mixin/mixin.js";
import { mapGetters } from "vuex";

export default {
  mixins: [mixin],
  data() {
    return {};
  },
  methods: {
    async getData() {
      await this.$store.dispatch("getAllMessageConnect");
      await this.$store.dispatch("getAllAccountIsListenerPagination", {
        page: 1,
        limit: 20,
      });
    },
    getOtherAccount(messageConnect) {
      if (messageConnect.account_1.account_id == this.account.account_id) {
        return messageConnect.account_2;
      } else {
        return messageConnect.account_1;
      }
    },
    getLastMessages(messageConnect) {
      if (messageConnect.messages.length == 0) {
        return {
          createdAt: messageConnect.createdAt,
          text: "",
          is_read: true,
        };
      }
      const message_connect = [...messageConnect.messages].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return message_connect[0];
    },
    toMessage(account_id) {
      if (this.$route.name == "Messages") {
        return this.$router.push("/messages/" + account_id);
      }
      if (
        this.$route.name == "Message" &&
        this.$route.params.account_id == account_id
      ) {
        this.getData();
        return;
      }
      return this.$router.push("/messages/" + account_id);
    },
  },
  async mounted() {
    const loading = this.$vs.loading();
    await this.getData();
    loading.close();

    let vm = this;
    this.$root.socket.on(
      "message_account_id_" + this.account.account_id,
      function (account_id) {
        if (account_id == vm.account.account_id) {
          vm.getData();
        }
      }
    );
  },
  computed: {
    ...mapGetters({
      isLogin: "isLogin",
      account: "getAccount",
      allMessageConnect: "getAllMessageConnect",
      allAccountIsListener: "getAllAccountIsListener",
    }),
  },
};
</script>
