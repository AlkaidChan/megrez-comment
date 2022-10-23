<template>
  <div class="comment-view" onclick="">
    <div class="comment-header">
      <img
        class="avatar"
        src="https://cdn.rawchen.com/logo/alkaidchen.jpg"
        width="80"
        height="80"
      />
      <span class="comment-author"
        ><a href="http://alkaidchen.com" target="_blank" rel="external nofollow"
          >alkaidchen</a
        >
      </span>
    </div>
    <div class="comment-content">
      <p>来都来了,看都看了</p>
    </div>
    <div class="comment-meta">
      <time class="comment-time">2022-09-17 17:28:34</time>&nbsp;&nbsp;
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
};
</script>

<style>
</style>
