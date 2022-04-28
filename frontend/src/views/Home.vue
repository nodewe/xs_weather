<template>
  <div class="home">
    <el-upload
      :on-success="uploadSuccess"
      class="upload-demo"
      :limit="1"
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      action="/api/upload"
    >
      <el-button size="small" type="primary">上传 Excel</el-button>
    </el-upload>
    <el-button
      style="margin-top: 10px"
      size="small"
      type="success"
      @click="download"
      >下载 Excel</el-button
    >
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import axios from "axios";
export default {
  name: "Home",
  data() {
    return {};
  },
  methods: {
    /**
     * 将blob或者File对象转换成blob地址
     * @param {Blob | File} blobOrFile blob或者File对象
     */
    createBlobUrl(blobOrFile) {
      const userAgent = window.navigator.userAgent;
      // 如果浏览器是谷歌或者Safari
      if (userAgent.indexOf("Chrome") > 0 || userAgent.indexOf("Safari") > 0) {
        return window.webkitURL.createObjectURL(blobOrFile);
      } else {
        // 反之就是就是火狐或者其他
        return window.URL.createObjectURL(blobOrFile);
      }
    },
    // 上传成功的钩子
    uploadSuccess(response, file, fileList) {
      if (response.code == 0) {
        this.$message.success(response.msg);
      } else {
        this.$message.error(response.msg);
      }
    },
    //下载excel
    async download() {
      const ret = await axios.get("/api/download", {
        responseType: "blob",
      });
      if (ret.data.size < 500) {
        this.$message.error("没有上传input.xlsx文件");
      } else {
        const blob = new Blob([ret.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = this.createBlobUrl(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "output.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        this.$message.success("下载成功");
      }
    },
  },
};
</script>
