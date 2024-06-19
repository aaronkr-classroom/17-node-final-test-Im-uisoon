// controllers/discussionsController.js
"use strict";

const Discussion = require("../models/Discussion");

const getDiscussionParams = (body, user) => {
  return {
    title: body.title,
    description: body.description,
    author: user,
    category: body.category,
    tags: body.tags,
  };
};

module.exports = {
  /**
   * =====================================================================
   * C: CREATE / 생성
   * =====================================================================
   */

  // 1.new 액션
  new: (req, res) => {
    res.render("discussions/new", {
      page: "new-discussion",
      title: "New Discussion",
    });
  },

  // 2.create 액션
  create: (req, res, next) => {
    let discussionParams = getDiscussionParams(req.body, req.user);

    Discussion.create(discussionParams)
      .then((discussion) => {
        req.flash("success", "Discussion created successfully!");
        res.locals.redirect = "/discussions";
        res.locals.discussion = discussion;
        next();
      })
      .catch((error) => {
        console.error(`Error saving discussion: ${error.message}`);
        req.flash("error", `Failed to create discussion because: ${error.message}.`);
        res.locals.redirect = "/discussions/new";
        next(error);
      });
  },

  //3. redirecttView 액션
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  /**
   * =====================================================================
   * R: READ / 조회
   * =====================================================================
   */

  // 4.index 액션
  index: (req, res, next) => {
    Discussion.find()
      .populate("author")
      .exec()
      .then((discussions) => {
        res.locals.discussions = discussions;
        next();
      })
      .catch((error) => {
        console.error(`Error fetching discussions: ${error.message}`);
        next(error);
      });
  },

  // 5. indexView 액션
  indexView: (req, res) => {
    res.render("discussions/index", {
      page: "discussions",
      title: "All Discussions",
    });
  },

  // 6. show 액션
  show: (req, res, next) => {
    Discussion.findById(req.params.id)
      .populate("author")
      .populate("comments")
      .exec()
      .then((discussion) => {
        if (!discussion) {
          res.locals.redirect = "/discussions";
          next();
        } else {
          discussion.views++;
          discussion.save();
          res.locals.discussion = discussion;
          next();
        }
      })
      .catch((error) => {
        console.error(`Error fetching discussion by ID: ${error.message}`);
        next(error);
      });
  },

  // 7. showView 액션
  showView: (req, res) => {
    res.render("discussions/show", {
      page: "discussion-details",
      title: "Discussion Details",
    });
  },

  /**
   * =====================================================================
   * U: UPDATE / 수정
   * =====================================================================
   */

  // 8. edit 액션
  edit: (req, res, next) => {
    Discussion.findById(req.params.id)
      .populate("author")
      .populate("comments")
      .exec()
      .then((discussion) => {
        res.locals.discussion = discussion;
        next();
      })
      .catch((error) => {
        console.error(`Error fetching discussion by ID for editing: ${error.message}`);
        next(error);
      });
  },

  // 9. update 액션
  update: (req, res, next) => {
    let discussionID = req.params.id,
      discussionParams = getDiscussionParams(req.body);

    Discussion.findByIdAndUpdate(discussionID, { $set: discussionParams }, { new: true })
      .populate("author")
      .exec()
      .then((discussion) => {
        res.locals.redirect = `/discussions/${discussion._id}`;
        res.locals.discussion = discussion;
        next();
      })
      .catch((error) => {
        console.error(`Error updating discussion: ${error.message}`);
        next(error);
      });
  },

  /**
   * =====================================================================
   * D: DELETE / 삭제
   * =====================================================================
   */

  // 10. delete 액션
  delete: (req, res, next) => {
    let discussionID = req.params.id;

    Discussion.findByIdAndRemove(discussionID)
      .then(() => {
        req.flash("success", "Discussion deleted successfully!");
        res.locals.redirect = "/discussions";
        next();
      })
      .catch((error) => {
        console.error(`Error deleting discussion by ID: ${error.message}`);
        req.flash("error", `Failed to delete discussion because: ${error.message}.`);
        next(error);
      });
  },
};
