<template>
  <div class="comment-container">
    <div id="comments" class="clearfix">
      <div class="zdypl">
        <span class="response" data-no-instant v-if="mode === 'reply'"
          >回复评论/
          <a href="javascript:void(0);" @click.prevent="handleClickCancelReply">
            取消回复</a
          >
        </span>
        <span class="response" data-no-instant v-if="mode === 'new'"
          >发表评论
        </span>
        <form id="comment-form" class="comment-form">
          <input
            type="text"
            name="author"
            maxlength="12"
            class="form-control input-control clearfix"
            placeholder="昵称 (必填哦)"
            v-model="commentForm.author"
            required
          />
          <input
            type="email"
            name="email"
            class="form-control input-control clearfix"
            placeholder="邮箱 (必填哦)"
            v-model="commentForm.email"
            required
          />
          <input
            type="url"
            name="url"
            class="form-control input-control clearfix"
            placeholder="博客地址（非必填）"
            v-model="commentForm.url"
          />
          <textarea
            name="text"
            class="form-control"
            placeholder="来都来了，看都看了，想说点什么吗 0_o"
            v-model="commentForm.content"
            required
          ></textarea>
          <button
            @click.prevent="clickSubmit"
            class="submit-enable"
            v-if="enableSubmit"
          >
            提 交
          </button>
          <button
            @click.prevent="clickSubmit"
            class="submit-disable"
            disabled="disabled"
            v-else
          >
            提 交
          </button>
        </form>
        <alert-list ref="alert"></alert-list>
      </div>

      <ol class="comment-list">
        <li
          class="comment-body comment-parent comment-odd"
          v-for="comment in comments"
          :key="comment.id"
        >
          <comment-item
            :comment="comment"
            @onClickReply="handleOnClickReply($event, comment.id)"
          ></comment-item>
          <div class="comment-children">
            <ol class="comment-list">
              <li
                class="comment-body comment-child comment-odd"
                v-for="subComment in comment.subComments"
                :key="subComment.id"
              >
                <comment-item
                  :comment="subComment"
                  :parent="comment"
                  @onClickReply="handleOnClickReply($event, comment.id)"
                ></comment-item>
              </li>
            </ol>
          </div>
        </li>
      </ol>

      <div class="comments-loading">
        <div class="loading-animation" v-if="isLoadingComments">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <div class="loading-end" v-if="isBottom">已经到底了</div>
      </div>
    </div>
  </div>
</template>

<script>
import CommentItem from "./CommentItem";
import ls from "../utils/storage";
import AlertList from "./alert/AlertList.vue";
import axios from "axios";
import md5 from "js-md5";
export default {
  data() {
    return {
      ls: {},
      mode: "new",
      enableSubmit: false,
      client: {},
      token: "",
      isLoadingComments: false,
      commentForm: {
        author: "",
        email: "",
        url: "",
        content: "",
        type: this.type,
        articleID: this.type == "article" ? this.id : 0,
        pageID: this.type == "page" ? this.id : 0,
        rootID: 0,
        parentID: 0,
      },
      isBottom: false,
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0,
      },
      comments: [],
    };
  },
  methods: {
    validateForm() {
      let emailExp =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      let emailRegex = new RegExp(emailExp);
      if (!emailRegex.exec(this.commentForm.email)) {
        this.$refs.alert.warning("邮箱格式不正确");
        return false;
      }
      if (this.commentForm.url != "") {
        let urlExp =
          /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
        let urlReg = new RegExp(urlExp);
        if (!urlReg.exec(this.commentForm.url)) {
          this.$refs.alert.warning("url 格式不正确");
          return false;
        }
      }
      return true;
    },
    clickSubmit() {
      if (!this.validateForm()) {
        return;
      }
      this.client
        .post("comment", this.commentForm)
        .then(() => {
          this.$refs.alert.success("提交成功");
          this.handleClickCancelReply();
          this.commentForm.content = "";

          this.fetchComments();
        })
        .catch(() => {
          this.$message.error("获取评论列表失败");
        })
        .finally(() => {
          // this.loading = false;
        });
      ls.set("Author", this.commentForm.author);
      ls.set("Email", this.commentForm.email);
      ls.set("URL", this.commentForm.url);
    },
    handleOnClickReply(pid, rid) {
      this.commentForm.parentID = pid;
      this.commentForm.rootID = rid;
      this.mode = "reply";
      let scrollBox = window;
      let anchorElement = document.getElementById("comments");
      if (scrollBox) {
        scrollBox.scrollTo({
          left: 0,
          top: anchorElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    },
    handleClickCancelReply() {
      this.commentForm.parentID = 0;
      this.commentForm.rootID = 0;
      this.mode = "new";
    },
    initApiClient() {
      var instance = axios.create({
        baseURL: "http://localhost:8080/api",
        timeout: 10000,
        withCredentials: false,
      });
      instance.interceptors.response.use(
        (response) => {
          if (response.status !== 200) return Promise.reject(response);
          const { status, msg } = response.data;
          if (status === 0) {
            return response.data;
          } else {
            this.$refs.alert.warning(msg);
          }
          return Promise.reject(response);
        },
        (err) => {
          this.$refs.alert.warning("请求路径或请求参数错误");
          return Promise.reject(err);
        }
      );
      this.client = instance;
    },
    fetchIdentity() {
      if (ls.get("Author")) {
        this.commentForm.author = ls.get("Author");
      }
      if (ls.get("Email")) {
        this.commentForm.email = ls.get("Email");
      }
      if (ls.get("URL")) {
        this.commentForm.url = ls.get("URL");
      }
    },
    fetchComments() {
      this.isLoadingComments = true;
      const { pageNum, pageSize } = this.pagination;
      this.client
        .get(this.type + "/" + this.id + "/comments", {
          params: { pageNum, pageSize },
        })
        .then((res) => {
          if (res.status === 0) {
            this.pagination.total = res.data.total;
            let comments = res.data.list || [];
            comments = comments.map((comment) => {
              if (comment.url) {
                comment.url =
                  comment.url.startsWith("http://") ||
                  comment.url.startsWith("https://")
                    ? comment.url
                    : "http://" + comment.url;
              }
              comment.avatar =
                "https://www.gravatar.com/avatar/" +
                md5(comment.mail.toLowerCase());
              comment.subComments = comment.subComments || [];
              comment.subComments = comment.subComments.map((subComment) => {
                if (subComment.url) {
                  subComment.url =
                    subComment.url.startsWith("http://") ||
                    subComment.url.startsWith("https://")
                      ? subComment.url
                      : "http://" + subComment.url;
                }
                subComment.avatar =
                  "https://www.gravatar.com/avatar/" +
                  md5(subComment.mail.toLowerCase());
                return subComment;
              });
              return comment;
            });
            this.comments = this.comments.concat(comments);
            // caculate page
            if (pageNum * pageSize >= this.pagination.total) {
              this.isBottom = true;
            }
            this.pagination.pageNum++;
          } else {
            this.$message.error("获取评论列表失败");
          }
        })
        .catch(() => {
          this.$message.error("获取评论列表失败");
        })
        .finally(() => {
          this.isLoadingComments = false;
        });
    },
    listenBottomOut() {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      const scrollHeight = document.documentElement.scrollHeight;
      if (scrollTop + clientHeight >= scrollHeight) {
        if (!this.isBottom && !this.isLoadingComments) {
          this.fetchComments();
        }
        return;
      }
    },
  },
  components: {
    CommentItem,
    AlertList,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      default: "article",
      validator: function (value) {
        // The value must match one of these strings
        return ["article", "page", "journal"].indexOf(value) !== -1;
      },
    },
  },
  watch: {
    commentForm: {
      handler: function () {
        if (
          this.commentForm.author === "" ||
          this.commentForm.email === "" ||
          this.commentForm.content === ""
        ) {
          this.enableSubmit = false;
          return;
        }
        this.enableSubmit = true;
      },
      deep: true,
    },
  },
  mounted() {
    window.addEventListener("scroll", this.listenBottomOut);
    this.fetchIdentity();
    this.initApiClient();
    this.fetchComments();
  },
  destroyed() {
    window.removeEventListener("scroll", this.listenBottomOut, false);
  },
};
</script>
<style lang="less">
/* CSS 初始化开始 */
* {
  /*把所有标签的内外边距取消掉*/
  margin: 0px;
  padding: 0px;
}

ul {
  /*去掉ul的小圆点*/
  list-style: none;
}

a {
  /*改变a链接的默认格式，颜色和下划线*/
  color: #716f70;
  text-decoration: none;
}

a.hover {
  /*改变鼠标经过颜色*/
  color: skyblue;
}

/* CSS 初始化结束 */

button,
input,
select,
textarea {
  font-family: -apple-system, SF UI Text, Arial, PingFang SC, Hiragino Sans GB,
    Microsoft YaHei, WenQuanYi Micro Hei, sans-serif;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
}

input:focus:invalid,
input:required:invalid,
textarea:focus:invalid,
textarea:required:invalid {
  box-shadow: none;
}

input::-webkit-input-placeholder,
textarea::-webkit-input-placeholder {
  color: #5f5f5f;
}

input:-moz-placeholder,
textarea:-moz-placeholder {
  color: #5f5f5f;
}

input::-moz-placeholder,
textarea::-moz-placeholder {
  color: #5f5f5f;
}

input:-ms-input-placeholder,
textarea:-ms-input-placeholder {
  color: #5f5f5f;
}

.comment-container {
  position: relative;
  z-index: 1;
  color: #5f5f5f;
  background-color: #f7f7f7;
}

#comments {
  max-width: 970px;
  margin: 0 auto;
  padding: 20px 20px 0 20px;
  padding-bottom: 1px;
}

#comments a {
  color: #5f5f5f;
}

#comments .comment-content a {
  /* border-bottom: 1px solid #b8b8b8; */
  border-bottom: 1px dotted #ccc;
  color: #63a1df;
}

#comments .comment-content a:hover {
  border-bottom: 1px solid #b8b8b8;
}

#comments a:hover {
  border-bottom: 2px solid #d1d1d1;
}

#comments .response {
  font-size: 14px;
  font-weight: 400;
  display: block;
  padding: 30px 0 30px 20px;
  color: #5f5f5f;
}

#comments .response a {
  color: #eb5055;
}

.comment-list {
  margin: 0;
  padding-left: 0;
  list-style-type: none;
}

.comment-parent {
  margin: 20px 0;
  border: 1px solid rgba(184, 197, 214, 0.2);
  border-radius: 3px;
  background: #fff;
  -webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.comment-parent:last-child {
  margin: 20px 0 0;
}

.comment-parent:first-child {
  margin: 0;
}

.comment-child,
.comment-child2 {
  border-top: 1px solid rgba(184, 197, 214, 0.2);
}

.comment-view {
  padding: 20px;
}

.comment-header {
  display: inline-block;
  width: 100%;
}

.comment-header .avatar {
  display: inline-block;
  float: left;
  width: 40px;
  height: 40px;
  border: 1px solid #eaeaea;
  border-radius: 50%;
}

.comment-header .avatar:hover {
  transform: rotate(666turn);
  transition-delay: 1s;
  transition-property: all;
  transition-duration: 59s;
  transition-timing-function: cubic-bezier(0.34, 0, 0.84, 1);
}

.comment-header .comment-author {
  font-size: 13px;
  line-height: 45px;
  display: inline-block;
  float: left;
  margin: 0 20px;
}

.comment-header .comment-by-author a {
  color: #eb5055 !important;
}

.comment-content {
  margin-bottom: 10px;
  color: #313131;
}

.comment-content img {
  margin-bottom: -8px;
  max-width: 100%;
}

.comment-meta {
  font-size: 12px;
  user-select: none;
}

.comment-meta .comment-reply {
  display: none;
  float: right;
}

.comment-meta .comment-reply a {
  color: #eb5055 !important;
}

.comment-view:hover .comment-meta .comment-reply {
  display: block;
}

.comment-parent > .comment-children .avatar {
  width: 34px;
  height: 34px;
  margin: 3px 0 0 3px;
}

.comment-parent > .comment-children .comment-author-at {
  float: left;
  margin-right: 5px;
}

.comment-parent > .comment-children .comment-content {
  margin: -3px 3px 10px;
}

.comment-parent > .comment-children .comment-meta {
  margin: 0 3px;
}

.comment-form {
  position: relative;
  margin: 0 0 20px;
  padding: 10px 20px;
  border-radius: 3px;
  background: #fff;
  -webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.comment-form .form-control {
  font-size: 13px;
  display: block;
  width: 100%;
  height: 34px;
  color: #313131;
  outline: 0;
}

.comment-form .form-control:focus {
  border-color: #eb5055;
  outline: 0;
}

.comment-form textarea.form-control {
  overflow: hidden;
  height: 150px;
  padding: 10px 0;
  resize: none;
  border: none;
  border-radius: 0;
  /* background:#FFF url(../images/comments-bg.jpg) right center no-repeat; */
  background-size: 200px;
}

.comment-form .input-control {
  float: left;
  width: 100%;
  max-width: 294.8px;
  border: none;
  border-bottom: 1px dashed #ddd;
  border-radius: 0;
}
/* for enabled submit button */
.comment-form .submit-enable {
  font-size: 13px;
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: block;
  line-height: 24px;
  height: 28px;
  margin: 0 auto;
  padding: 0 20px;
  -webkit-transition-duration: 0.4s;
  transition-duration: 0.4s;
  text-align: center;
  color: #fafafa;
  border: 1px solid #eb5055;
  border-radius: 5px;
  background-color: #eb5055;
}

.comment-form .submit-enable:hover,
.submit-enable:active,
.submit-enable:active:focus,
.submit-enable:focus {
  color: #eb5055;
  cursor: pointer;
  border: 1px solid #eb5055;
  outline-style: none;
  background-color: #fafafa;
}

/* for disabled submit button */
.comment-form .submit-disable {
  font-size: 13px;
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: block;
  line-height: 24px;
  height: 28px;
  margin: 0 auto;
  padding: 0 20px;
  -webkit-transition-duration: 0.4s;
  transition-duration: 0.4s;
  text-align: center;
  color: #313131;
  border: 1px solid #dedede;
  border-radius: 5px;
  background-color: #f7f7f7;
}

.comment-form .submit-disable:hover,
.submit-disable:active,
.submit-disable:active:focus,
.submit-disable:focus {
  color: #313131;
  cursor: not-allowed;
  outline-style: none;
  background-color: #fafafa;
}

.comment-list .comment-form {
  border: 1.8px #d6d6d6 dashed;
  padding: 10px 10px !important;
}

.comment-list .zdypl {
  padding: 10px;
  margin-bottom: -40px;
  margin-top: -10px !important;
}

.comments-loading {
  .loading-animation {
    margin-left: 60%;
    transform: translate3d(-50%, -50%, 0);
    margin-top: 30px;
    background-color: #f7f7f7;
    .dot {
      width: 24px;
      height: 24px;
      background: #3ac;
      border-radius: 100%;
      display: inline-block;
      animation: slide 1s infinite;
    }
    .dot:nth-child(1) {
      animation-delay: 0.1s;
      background: #32aacc;
    }
    .dot:nth-child(2) {
      animation-delay: 0.2s;
      background: #64aacc;
    }
    .dot:nth-child(3) {
      animation-delay: 0.3s;
      background: #96aacc;
    }
    .dot:nth-child(4) {
      animation-delay: 0.4s;
      background: #c8aacc;
    }
    .dot:nth-child(5) {
      animation-delay: 0.5s;
      background: #faaacc;
    }
    @-moz-keyframes slide {
      0% {
        transform: scale(1);
      }
      50% {
        opacity: 0.3;
        transform: scale(2);
      }
      100% {
        transform: scale(1);
      }
    }
    @-webkit-keyframes slide {
      0% {
        transform: scale(1);
      }
      50% {
        opacity: 0.3;
        transform: scale(2);
      }
      100% {
        transform: scale(1);
      }
    }
    @-o-keyframes slide {
      0% {
        transform: scale(1);
      }
      50% {
        opacity: 0.3;
        transform: scale(2);
      }
      100% {
        transform: scale(1);
      }
    }
    @keyframes slide {
      0% {
        transform: scale(1);
      }
      50% {
        opacity: 0.3;
        transform: scale(2);
      }
      100% {
        transform: scale(1);
      }
    }
  }
  .loading-end {
    margin-top: 20px;
    margin-bottom: 20px;
    text-align: center;
  }
}
</style>