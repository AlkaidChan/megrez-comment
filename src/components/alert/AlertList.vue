<template>
  <div class="alert-list">
    <div v-for="(node, idx) in nodes" :key="idx">
      <alert-item :show="node.shiow" :type="node.type" @close="handleNodeClose">
        {{ node.message }}
      </alert-item>
    </div>
  </div>
</template>

<script>
import AlertItem from "./AlertItem.vue";
export default {
  components: { AlertItem },
  name: "AlertList",

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
      nodes: [],
    };
  },
  methods: {
    info(msg) {
      this.nodes.push({
        type: "info",
        show: true,
        message: msg,
      });
    },
    success(msg) {
      this.nodes.push({
        type: "success",
        show: true,
        message: msg,
      });
    },
    warning(msg) {
      this.nodes.push({
        type: "warning",
        show: true,
        message: msg,
      });
    },
    error(msg) {
      this.nodes.push({
        type: "error",
        show: true,
        message: msg,
      });
    },
    handleNodeClose() {
      // TODO: 清理 nodes 内存
      // this.nodes.pop()
    }
  },
};
</script>
