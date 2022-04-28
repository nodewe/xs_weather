
import Vue from 'vue'
import {
  Button,
  Upload,
  MessageBox,
  Message
} from 'element-ui'
Vue.use(Button)
Vue.use(Upload)
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$message = Message
