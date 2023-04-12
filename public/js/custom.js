$(document).ready(function () {
  // SideBars

  if ($("#right-menu-toggle").length > 0) {
    $("#right-menu-toggle").click(function () {
      if ($("#right-menu").hasClass("show")) {
        $("#right-menu").removeClass("show");
        $("#content-holder").removeClass("right-open");
      } else {
        $("#right-menu").addClass("show");
        $("#content-holder").addClass("right-open");
      }
    });
  }

  if ($("#left-menu-toggle").length > 0) {
    $("#left-menu-toggle").click(function () {
      if ($("#left-menu").hasClass("show")) {
        $("#left-menu").removeClass("show");
        $("#content-holder").removeClass("left-open");
      } else {
        $("#left-menu").addClass("show");
        $("#content-holder").addClass("left-open");
      }
    });
  }

  // Automatically Show the Side Menu if class .open-rightmenu is added to body
  function responsiveMenus() {
    if (screen.width < 991) {
      if ($("#right-menu-toggle").length > 0) {
        if ($("#right-menu").hasClass("show")) {
          $("#right-menu").removeClass("show");
        }
      }

      if ($("#left-menu-toggle").length > 0) {
        if ($("#left-menu").hasClass("show")) {
          $("#left-menu").removeClass("show");
        }
      }
    } else {
      if ($("#right-menu-toggle").length > 0) {
        if (!$("#right-menu").hasClass("show")) {
          $("#right-menu").addClass("show");
        }
      }

      if ($("#left-menu-toggle").length > 0) {
        if (!$("#left-menu").hasClass("show")) {
          $("#left-menu").addClass("show");
        }
      }

      if ($("#content-holder").length > 0) {
        $("#content-holder").addClass("left-open");
        $("#content-holder").addClass("right-open");
      }
    }
  }

  responsiveMenus();

  $(window).resize(function () {
    responsiveMenus();
  });

  if (screen.width < 767) {
    if (
      $("#right-menu-toggle").length > 0 &&
      $("#left-menu-toggle").length > 0
    ) {
      $("#right-menu-toggle").click(function () {
        if ($("#right-menu").hasClass("show")) {
          $("#left-menu").removeClass("show");
        }
      });

      $("#left-menu-toggle").click(function () {
        if ($("#left-menu").hasClass("show")) {
          $("#right-menu").removeClass("show");
        }
      });
    }
  }

  // Folders
  $(".folder-trigger").click(function () {
    $(this).toggleClass("open-folder");
  });
});

// Theme: Dark / Light
$("#theme").click(function () {
  $("body").toggleClass("dark-theme");
  $("body").toggleClass("light-theme");

  $("#theme .icon").toggleClass("icon-sun");
  $("#theme .icon").toggleClass("icon-moon");
});
