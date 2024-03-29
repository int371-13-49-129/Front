<template>
  <div class="w-full h-full overflow-y-auto">
    <NavbarSidebar></NavbarSidebar>
    <div class="pt-16 xl:pb-0 pb-12 w-full h-full flex justify-center gap-8">
      <div
        class="xl:block hidden filter xl:drop-shadow-all w-1/4 mt-3 xl:h-95/100 bg-white rounded-2xl p-4 overflow-y-auto"
      >
        <MessageConnect></MessageConnect>
      </div>
      <div
        class="flex flex-col filter xl:drop-shadow-all w-full xl:mt-3 xl:h-95/100 bg-white rounded-2xl p-4 overflow-y-auto"
        :class="showProfile ? 'xl:w-1/3' : 'xl:w-3/5'"
      >
        <div class="flex items-center mb-2">
          <vs-avatar circle>
            <img
              v-if="getOtherAccount.image_url"
              :src="getFile(getOtherAccount.image_url)"
              alt=""
            />
            <i v-else class="bx bx-user"></i>
          </vs-avatar>
          <div
            class="text-xl font-semibold ml-4 flex-grow hover:underline cursor-pointer"
            @click.stop="$router.push('/profile/' + getOtherAccount.account_id)"
          >
            {{ getName(getOtherAccount) }}
          </div>
          <div class="xl:block hidden cursor-pointer">
            <i
              @click="showProfile = !showProfile"
              class="bx bx-info-circle text-3xl"
            ></i>
          </div>
          <div class="cursor-pointer">
            <i
              @click="modalActive = true"
              class="bx bx-dots-vertical-rounded text-2xl"
            ></i>
          </div>
        </div>
        <div
          class="flex-grow w-full flex flex-col-reverse overflow-y-auto"
          ref="message"
        >
          <div
            v-if="
              messageCon.message_connect_status == 'inactive' &&
              !getOtherAccount.is_listener &&
              getOtherAccount.role != 'Psychologist'
            "
            class="flex items-center flex-col"
          >
            <div class="p-3 bg-gray-50 border-2 rounded-2xl my-2 text-gray-600">
              บัญชีผู้ใช้นี่ไม่ได้เปิดเป็นผู้รับฟัง
              หากต้องการส่งข้อความกรุณาส่งคำขอส่งข้อความ
            </div>
            <vs-button
              class="w-full xl:w-1/3 text-base py-2"
              border
              @click="modalRequest = true"
            >
              คำขอส่งข้อความ</vs-button
            >
          </div>
          <div
            v-if="messageCon.message_connect_status == 'waiting'"
            class="flex items-center flex-col"
          >
            <div
              class="p-3 bg-primary bg-opacity-10 rounded-2xl my-2 text-gray-700 w-full"
            >
              <div class="border-b-2 pb-2 mb-2">คำขอส่งข้อความ</div>
              <div>{{ req.text }}</div>
            </div>
            <vs-button
              class="w-full xl:w-1/3 text-base py-2"
              border
              v-if="account.account_id == req.account_id"
              @click="(modalRequest = true), (request = req.text)"
            >
              แก้ไขคำขอส่งข้อความ</vs-button
            >
            <div v-else class="flex xl:flex-row flex-col w-full xl:gap-x-3">
              <vs-button
                class="w-auto xl:w-1/2 text-base py-2"
                @click="acceptRequest()"
                border
              >
                ยอมรับคำขอ</vs-button
              >
              <vs-button
                class="w-auto xl:w-1/2 text-base py-2"
                @click="rejectRequest()"
                border
                danger
              >
                ลบ</vs-button
              >
            </div>
          </div>
          <div
            v-if="
              messageCon.message_connect_status == 'inactive' &&
              (getOtherAccount.is_listener ||
                getOtherAccount.role == 'Psychologist')
            "
            class="flex items-center flex-col"
          >
            <div class="p-3 bg-gray-50 border-2 rounded-2xl my-2 text-gray-600">
              การส่งข้อความถูกปิดไว้
              หากต้องการส่งข้อความสามารถเปิดการส่งข้อความได้
            </div>
            <vs-button
              class="w-full xl:w-1/3 text-base py-2"
              border
              @click="activateMessageConnect()"
            >
              เปิดการส่งข้อความ</vs-button
            >
          </div>
          <div
            v-for="(message, i) in messageCon.messages"
            :key="message.message_id"
          >
            <div class="flex justify-center items-center">
              <div
                class="text-gray-400 text-sm mt-2"
                v-if="
                  messageCon.messages[i + 1]
                    ? !sameDay(
                        message.createdAt,
                        messageCon.messages[i + 1].createdAt
                      )
                    : true
                "
              >
                {{ getDate(message.createdAt) }}
              </div>
            </div>
            <div
              :class="
                message.account_id != account.account_id
                  ? 'flex flex-row'
                  : 'flex flex-row-reverse'
              "
            >
              <div
                class="p-2 bg-gray-100 rounded-2xl my-2 break-words"
                style="max-width: 80%"
                :class="
                  message.account_id != account.account_id
                    ? 'rounded-bl-none'
                    : 'rounded-br-none'
                "
              >
                <vue-load-image
                  v-if="message.image_url"
                  class="xl:max-h-60 w-full"
                >
                  <img
                    slot="image"
                    :src="getFile(message.image_url)"
                    class="xl:max-h-60 h-full w-full object-contain cursor-pointer"
                    @click="(modalImg = true), (img = message.image_url)"
                    alt=""
                  />
                  <img
                    slot="preloader"
                    src="@/assets/img/preload.svg"
                    class="animate-pulse object-contain w-full h-56"
                  />
                </vue-load-image>
                <span v-else>{{ message.text }}</span>
              </div>
              <div
                class="w-1/5 text-xs text-gray-400 my-2 flex items-end px-1"
                :class="
                  message.account_id != account.account_id ? '' : 'justify-end'
                "
              >
                {{ getTime(message.createdAt) }}
              </div>
            </div>
          </div>
          <div
            v-if="!lastMessage"
            v-observe-visibility="visibilityChanged"
            class="flex justify-center items-center text-gray-500"
          >
            <i
              class="bx bx-loader-alt text-2xl"
              :class="isVisible ? 'animate-spin' : ''"
            ></i>
          </div>
          <div
            v-else-if="messageCon.messages.length > 0"
            class="flex justify-center items-center gap-2"
          >
            <div class="flex-grow border-b-2"></div>
            <div class="text-gray-400">เริ่มการสนทนา</div>
            <div class="flex-grow border-b-2"></div>
          </div>
        </div>
        <div class="flex items-center w-full relative">
          <label for="url" class="cursor-pointer">
            <i class="bx bx-image text-4xl text-primary"></i>
          </label>
          <input
            class="hidden"
            type="file"
            id="url"
            ref="myFiles"
            accept=".jpg, .jpeg, .png"
            @change="previewFiles"
          />
          <vs-input
            type="text"
            v-model.trim="text"
            @keyup.enter="text == '' ? '' : createMessage()"
            placeholder="Aa..."
            class="input-comment flex-grow mx-4"
          />
          <vs-button
            @click="text == '' ? '' : createMessage()"
            circle
            size="large"
            ><span class="xl:mx-2 mx-1 xl:text-base text-sm"
              >Send</span
            ></vs-button
          >
          <div
            v-if="messageCon.message_connect_status != 'active'"
            class="absolute w-full h-full bg-white opacity-60 z-10"
          ></div>
        </div>
      </div>
      <div
        v-show="showProfile && getOtherAccount.account_id"
        class="xl:block hidden w-1/4 h-95/100"
      >
        <DataProfile
          :key="getOtherAccount.account_id"
          v-if="getOtherAccount.account_id"
          ref="dataProfile"
          class="h-full overflow-scroll"
          :account_id="getOtherAccount.account_id"
        ></DataProfile>
      </div>
      <vs-dialog v-model="modalImg">
        <div class="flex items-center justify-center">
          <vue-load-image class="xl:max-h-144 w-screen xl:w-auto px-1 pt-3">
            <img
              slot="image"
              :src="getFile(img)"
              class="xl:max-h-144 h-full w-full object-contain"
              alt=""
            />
            <img
              slot="preloader"
              src="@/assets/img/preload.svg"
              class="animate-pulse object-contain w-full xl:h-128"
            />
          </vue-load-image>
        </div>
      </vs-dialog>
      <vs-dialog v-model="modalUpload">
        <div class="flex items-center justify-center mb-6">
          <div class="xl:max-h-80 w-screen xl:w-auto px-1 pt-3">
            <img
              slot="image"
              :src="imgUpload"
              class="xl:max-h-80 h-full w-full object-contain"
              alt=""
            />
          </div>
        </div>
        <vs-button @click="createMessage(true)" shadow block border size="large"
          >ส่งรูป
        </vs-button>
        <vs-button
          @click="modalUpload = false"
          danger
          border
          block
          size="large"
        >
          ยกเลิก
        </vs-button>
      </vs-dialog>
      <vs-dialog v-model="modalActive">
        <template #header>
          <div class="mt-2 text-lg font-semibold">จัดการการสนทนา</div>
        </template>
        <vs-button
          shadow
          block
          border
          v-if="
            getOtherAccount.account_id && getOtherAccount.role == 'Psychologist'
          "
          @click="showModalReview()"
          size="large"
        >
          <i class="bx bx-star mr-2"></i>ให้คะแนนและรีวิว
        </vs-button>
        <vs-button
          shadow
          block
          border
          v-if="messageCon.message_connect_status == 'active'"
          @click="deactivateMessageConnect()"
          size="large"
        >
          ปิดการส่งข้อความ
        </vs-button>
        <vs-button danger border block size="large" @click="modalReport = true">
          <i class="bx bxs-report mr-2"></i>รายงานการสนทนา
        </vs-button>
      </vs-dialog>
      <vs-dialog v-model="modalRequest">
        <template #header>
          <div class="mt-2 text-lg font-semibold">คำขอส่งข้อความ</div>
        </template>
        <div class="mt-2">
          <textarea
            class="focus:outline-none w-full px-6 py-4 rounded-xl mt-1 scroll border-2 h-40"
            v-model.trim="request"
          ></textarea>
        </div>
        <div class="flex justify-center">
          <vs-button
            :disabled="request == ''"
            @click="request == '' ? '' : createRequest()"
          >
            <span class="mx-3">ส่งคำขอ</span>
          </vs-button>
        </div>
      </vs-dialog>
      <vs-dialog v-model="modalReport">
        <template #header>
          <div class="mt-2 text-lg font-semibold">รายงานการสนทนา</div>
        </template>
        <div class="mt-2">
          <textarea
            placeholder="รายละเอียด"
            class="focus:outline-none w-full px-6 py-4 rounded-xl mt-1 scroll border-2 h-40"
            v-model.trim="report"
          ></textarea>
        </div>
        <div class="flex justify-center">
          <vs-button
            :disabled="report == ''"
            @click="report == '' ? '' : createReport()"
          >
            <span class="mx-3">ส่ง</span>
          </vs-button>
        </div>
      </vs-dialog>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import VueLoadImage from "vue-load-image";
import mixin from "@/mixin/mixin.js";
import NavbarSidebar from "@/components/NavbarSidebar.vue";
import MessageConnect from "@/components/MessageConnect.vue";
import DataProfile from "@/components/DataProfile.vue";

export default {
  mixins: [mixin],
  data() {
    return {
      account_id: this.$route.params.account_id,
      modalImg: false,
      text: "",
      img: "",
      files: "",
      imgUpload: "",
      modalUpload: false,
      image_url: null,
      page: 1,
      lastMessage: false,
      isVisible: false,
      showProfile: false,
      modalActive: false,
      modalRequest: false,
      request: "",
      req: {},
      modalReport: false,
      report: "",
    };
  },
  components: {
    NavbarSidebar,
    MessageConnect,
    VueLoadImage,
    DataProfile,
  },
  methods: {
    async getData(load_more = false) {
      if (this.account.account_id == this.account_id) {
        this.$router.push("/messages");
        return null;
      }
      try {
        let res = null;
        if (load_more) {
          this.page += 1;
          res = await this.$store.dispatch("getMessageConnectPagination", {
            account_id: this.account_id,
            page: this.page,
          });
          if (res.length < 20) {
            this.lastMessage = true;
          }
        } else {
          this.toTop();
          this.page = 1;
          res = await this.$store.dispatch("getMessageConnectPagination", {
            account_id: this.account_id,
            page: this.page,
          });
          this.lastMessage = false;
          this.toTop();
        }
        if (this.messageCon.message_connect_status == "waiting") {
          const req = await this.$store.dispatch(
            "getRequest",
            this.messageCon.message_connect_id
          );
          if (req.data) {
            this.req = req.data.request;
            this.request = this.req.text;
          }
        }
        const messages = this.messageCon.messages;
        for (let i = 0; i < messages.length; i++) {
          const message = messages[i];
          if (message.is_read) break;
          if (message.account_id == this.account_id) {
            await this.$store.dispatch("readMessage", {
              message_id: message.message_id,
            });
          }
        }
        return res;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    async createMessage(isImg = false) {
      const loading = this.$vs.loading();
      if (isImg) {
        const res = await this.$store.dispatch("uploadFile", this.files);
        this.image_url = res.data.file_id;
        this.text = "";
      } else {
        this.image_url = null;
      }
      await this.$store.dispatch("createMessage", {
        account_id_2: this.account_id,
        text: this.text,
        message_connect_id: this.messageCon.message_connect_id,
        image_url: this.image_url,
      });
      await this.getData();
      this.text = "";
      this.modalUpload = false;
      this.image_url = null;
      loading.close();
    },
    sameDay(d1, d2) {
      const date1 = new Date(d1);
      const date2 = new Date(d2);
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    },
    previewFiles() {
      if (!this.$refs.myFiles.files[0]) return;
      this.files = this.$refs.myFiles.files[0];
      this.imgUpload = URL.createObjectURL(this.files);
      this.modalUpload = true;
    },
    toTop() {
      if (this.$refs.message) {
        this.$refs.message.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    visibilityChanged(isVisible) {
      this.isVisible = isVisible;
      if (isVisible) {
        this.getData(true);
      }
    },
    showModalReview() {
      this.showProfile = true;
      this.modalActive = false;
      this.$refs.dataProfile.showModalReview();
    },
    createRequest() {
      this.$store.dispatch("createRequest", {
        message_connect_id: this.messageCon.message_connect_id,
        text: this.request,
      });
      this.modalRequest = false;
    },
    acceptRequest() {
      this.$store.dispatch("acceptRequest", {
        message_connect_id: this.messageCon.message_connect_id,
      });
    },
    rejectRequest() {
      this.$store.dispatch("rejectRequest", {
        message_connect_id: this.messageCon.message_connect_id,
      });
    },
    activateMessageConnect() {
      this.$store.dispatch("activateMessageConnect", {
        message_connect_id: this.messageCon.message_connect_id,
      });
    },
    deactivateMessageConnect() {
      this.$store.dispatch("deactivateMessageConnect", {
        message_connect_id: this.messageCon.message_connect_id,
      });
      this.modalActive = false;
    },
    createReport() {
      this.$store.dispatch("createReport", {
        account_id: this.account_id,
        message: this.report,
      });
      this.report = "";
      this.modalReport = false;
      this.$vs.notification({
        progress: "auto",
        flat: true,
        color: "primary",
        position: "top-right",
        title: "ส่งรายงานการสนทนาสำเร็จ",
      });
    },
  },
  async mounted() {
    const loading = this.$vs.loading();
    this.account_id = this.$route.params.account_id;
    await this.getData();
    loading.close();

    let vm = this;
    this.$root.socket.on(
      "message_connect_id_" + this.messageCon.message_connect_id,
      function (message_connect_id) {
        if (message_connect_id == vm.messageCon.message_connect_id) {
          vm.getData();
        }
      }
    );
  },
  computed: {
    ...mapGetters({
      isLogin: "isLogin",
      account: "getAccount",
      messageCon: "getMessageConnect",
    }),
    getOtherAccount() {
      if (!this.messageCon.account_1) {
        return {};
      }
      if (this.messageCon.account_1.account_id == this.account.account_id) {
        return this.messageCon.account_2;
      } else {
        return this.messageCon.account_1;
      }
    },
  },
  watch: {
    "$route.params.account_id": async function () {
      this.account_id = this.$route.params.account_id;
      this.showProfile = false;
      await this.getData();
    },
    modalUpload: function () {
      if (this.modalUpload == false) {
        this.$refs.myFiles.value = null;
        this.files = "";
        this.imgUpload = "";
      }
    },
  },
};
</script>
<style lang="css">
.input-comment .vs-input {
  width: 100% !important;
  border-radius: 9999px !important;
}
</style>
