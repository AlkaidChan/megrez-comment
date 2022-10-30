<template>
  <div class="comment-view" :id="'comment-'+comment.id" onclick="">
    <div class="comment-header">
      <img class="avatar" :src="comment.avatar" width="80" height="80" />
      <span class="comment-author" v-if="comment.url">
        <a :href="comment.url" target="_blank" rel="external nofollow">
          {{ comment.author }}</a
        >
        <span class="commentapprove" v-if="comment.role == 'admin'" style="font-family: PingFang SC,Microsoft YaHei,sans-serif; margin-left:5px; 
                    color: #FFF; padding: .1rem .25rem; font-size: .7rem; border-radius: .25rem;background-color: #ff5050;">博主</span>
      </span>
      <span class="comment-author" v-else>
        {{comment.author}}
        <span class="commentapprove" v-if="comment.role == 'admin'" style="font-family: PingFang SC,Microsoft YaHei,sans-serif; margin-left:5px; 
                    color: #FFF; padding: .1rem .25rem; font-size: .7rem; border-radius: .25rem;background-color: #ff5050;">博主</span>
      </span>
    </div>
    <div class="comment-content">
      <span class="comment-author-at" v-if="parent">
        <a href="javascript:void(0);" @click="handleClickParent()">@{{parent.author}}</a>
        </span>
      <p>{{ comment.content }}</p>
    </div>
    <div class="comment-meta">
      <time class="comment-time">{{ comment.createTime }}</time
      >&nbsp;&nbsp;
      <span class="agent"><i class="fa fa-windows"></i> Windows 10</span
      >&nbsp;&nbsp;
      <span class="agent"><i class="fa fa-chrome"></i> Chrome 95</span>
      <span class="comment-reply" data-no-instant>
        <a
          href="javascript:void(0);"
          rel="nofollow"
          @click.prevent="handleClickReply"
          >回复</a
        >
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: "CommentItem",
  props: {
    comment: {
      type: Object,
      required: true,
    },
    parent: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      // comment: {
      //   id: 0,
      //   author: "",
      //   avatar: "",
      //   email: "",
      //   url: "",
      //   content: "",
      //   createTime: "",
      // },
    };
  },
  methods: {
    handleClickReply() {
      this.$emit("onClickReply", this.comment.id)
    },
    handleClickParent() {
      let scrollBox = window;
      let anchorElement = document.getElementById("comment-" + this.parent.id);
      if (scrollBox) {
        scrollBox.scrollTo({
          left: 0,
          top: anchorElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    }
  }
};
</script>

<style>
</style>
