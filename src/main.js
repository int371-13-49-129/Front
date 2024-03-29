import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/tailwind.css";
import Vuesax from "vuesax";
import VueObserveVisibility from "vue-observe-visibility";
import VueCarousel from "vue-carousel";
import CKEditor from "@ckeditor/ckeditor5-vue2";
import "boxicons/css/boxicons.min.css";
import "vuesax/dist/vuesax.css";
import { io } from "socket.io-client";
import { baseUrlSocket } from "./util/backend.js";

Vue.config.productionTip = false;
Vue.use(VueObserveVisibility);
Vue.use(VueCarousel);
Vue.use(CKEditor);
Vue.use(Vuesax, {
  colors: {
    primary: "#5CB5E8",
  },
});

new Vue({
  router,
  store,
  render: (h) => h(App),
  data() {
    return {
      socket: io(baseUrlSocket()),
    };
  },
}).$mount("#app");
