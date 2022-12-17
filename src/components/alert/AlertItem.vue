<template>
  <div>
    <!-- info -->
    <div v-show="visible" class="alert-node-info" v-if="type == 'info'">
      <i class="fa fa-info-circle icon"></i>
      <slot></slot>
      <i v-show="closable" class="fa fa-times close-icon" @click="close"></i>
    </div>
    <!-- success -->
    <div v-show="visible" class="alert-node-success" v-if="type == 'success'">
      <i class="fa fa-info-circle icon"></i>
      <slot></slot>
      <i v-show="closable" class="fa fa-times close-icon" @click="close"></i>
    </div>
    <!-- warning -->
    <div v-show="visible" class="alert-node-warning" v-if="type == 'warning'">
      <i class="fa fa-info-circle icon"></i>
      <slot></slot>
      <i v-show="closable" class="fa fa-times close-icon" @click="close"></i>
    </div>
    <!-- error -->
    <div v-show="visible" class="alert-node-error" v-if="type == 'error'">
      <i class="fa fa-info-circle icon"></i>
      <slot></slot>
      <i v-show="closable" class="fa fa-times close-icon" @click="close"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: "AlertItem",

  props: {
    closable: {
      type: Boolean,
      default: true,
    },
    show: {
      type: Boolean,
      default: true,
      twoWay: true,
    },
    type: {
      type: String,
      default: "info",
    },
  },
  data() {
    return {
      timer: {},
      visible: this.show,
    };
  },
  methods: {
    close() {
      this.visible = false;
      this.$emit("update:show", false);
      this.$emit("close");
    },
    setInterval(mills = 5000) {
      this.timer = setTimeout(() => {
        this.close();
      }, mills);
    },
  },
  mounted() {
    this.setInterval();
  },
};
</script>

<style lang="less" scoped >
@import "~@/assets/css/font-awesome.min.css";
.alert-node {
  padding: 12px 24px;
  height: 22px;
  margin-bottom: 10px;
  border-radius: 5px;
  font-size: 14px;
  line-height: 22px;
  .icon {
    font-size: 16px;
    line-height: 22px;
  }
  .close-icon {
    font-size: 16px;
    line-height: 22px;
    float: right;
  }
}

.alert-node-info {
  .alert-node();
  background-color: #c4d7fc;
}

.alert-node-success {
  .alert-node();
  background-color: #c6eadd;
}

.alert-node-warning {
  .alert-node();
  background-color: #f4e0c8;
}

.alert-node-error {
  .alert-node();
  background-color: #f3d9da;
}
</style>
