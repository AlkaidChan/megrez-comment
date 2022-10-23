<template>
  <div class="comment-container">
    <div id="comments" class="clearfix">
      <div class="zdypl">
        <span class="response" data-no-instant v-if="mode === 'reply'"
          >回复评论/
          <a href="javascript:void(0);" @click.prevent="clickCancelReply">
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
            placeholder="博客地址 (http:// | https://)"
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
        <li class="comment-body comment-parent comment-odd" v-for="comment in comments" :key="comment.id">
          <comment-item :comment=comment></comment-item>
          <div class="comment-children">
            <ol class="comment-list">
              <li class="comment-body comment-child comment-odd" v-for="subComment in comment.subComments" :key="subComment.id">
                <comment-item :comment=subComment></comment-item>
              </li>
            </ol>
          </div>
        </li>
      </ol>
      <div class="lists-navigator clearfix">
        <ol class="page-navigator">
          <li class="current"><a href="/2/comment-page/1#comments">1</a></li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script>
import CommentItem from "./CommentItem";
import AlertList from "./alert/AlertList.vue";
import axios from "axios";
export default {
  data() {
    return {
      mode: "reply",
      enableSubmit: false,
      client: {},
      commentForm: {
        author: "",
        email: "",
        url: "",
        content: "",
      },

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
      if (this.commentForm.url != '') {
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
      alert("提交成功");
    },
    clickCancelReply() {
      console.log("click reply");
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
          if (status === 0) return response.data;
          if (msg) {
            this.$refs.alert.warning("msg");
          } else {
            this.$refs.alert.warning("未知服务端错误");
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
    fetchComments() {
      const { pageNum, pageSize } = this.pagination;
      this.client
        .get(this.type + "/" + this.id + "/comments", {
          params: { pageNum, pageSize },
        })
        .then((res) => {
          if (res.status === 0) {
            this.pagination.total = res.data.total;
            this.comments = res.data.list || [];
          } else {
            this.$message.error("获取评论列表失败");
          }
        })
        .catch(() => {
          this.$message.error("获取评论列表失败");
        })
        .finally(() => {
          // this.loading = false;
        });
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
    this.initApiClient();
    this.fetchComments();
  },
};
</script>
<style>
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

body {
  /*把主体设为统一格式*/
  font-size: 12px;
  font-family: "微软雅黑";
  color: #716f70;
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

#comments .page-navigator a:hover {
  border-bottom: none;
}

#comments .lists-navigator a:hover {
  color: #eb5050;
}

#comments .lists-navigator {
  margin: 20px 0;
}

#comments .lists-navigator ol {
  margin: 20px 0;
  padding: 0 10px;
  list-style: none;
  text-align: center;
}

#comments .lists-navigator ol li.current a {
  color: #fff;
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

#comments .page-navigator {
  margin: 0;
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
</style>