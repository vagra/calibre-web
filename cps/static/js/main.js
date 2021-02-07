/* This file is part of the Calibre-Web (https://github.com/janeczku/calibre-web)
 *    Copyright (C) 2012-2019  mutschler, janeczku, jkrehm, OzzieIsaacs
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */


function getPath() {
    var jsFileLocation = $("script[src*=jquery]").attr("src");  // the js file path
    return jsFileLocation.substr(0, jsFileLocation.search("/static/js/libs/jquery.min.js"));  // the js folder path
}
// Generic control/related handler to show/hide fields based on a checkbox' value
// e.g.
//  <input type="checkbox" data-control="stuff-to-show">
//  <div data-related="stuff-to-show">...</div>
$(document).on("change", "input[type=\"checkbox\"][data-control]", function () {
    var $this = $(this);
    var name = $this.data("control");
    var showOrHide = $this.prop("checked");

    $("[data-related=\"" + name + "\"]").each(function () {
        $(this).toggle(showOrHide);
    });
});

// Generic control/related handler to show/hide fields based on a select' value
$(document).on("change", "select[data-control]", function() {
    var $this = $(this);
    var name = $this.data("control");
    var showOrHide = parseInt($this.val());
    // var showOrHideLast = $("#" + name + " option:last").val()
    for (var i = 0; i < $(this)[0].length; i++) {
        var element = parseInt($(this)[0][i].value);
        if (element === showOrHide) {
            $("[data-related^=" + name + "][data-related*=-" + element + "]").show();
        } else {
            $("[data-related^=" + name + "][data-related*=-" + element + "]").hide();
        }
    }
});

// Generic control/related handler to show/hide fields based on a select' value
// this one is made to show all values if select value is not 0
$(document).on("change", "select[data-controlall]", function() {
    var $this = $(this);
    var name = $this.data("controlall");
    var showOrHide = parseInt($this.val());
    if (showOrHide) {
        $("[data-related=" + name + "]").show();
    } else {
        $("[data-related=" + name + "]").hide();
    }
});

// Syntax has to be bind not on, otherwise problems with firefox
$(".container-fluid").bind("dragenter dragover", function () {
    if($("#btn-upload").length && !$('body').hasClass('shelforder')) {
        $(this).css('background', '#e6e6e6');
    }
    return false;
});

// Syntax has to be bind not on, otherwise problems with firefox
$(".container-fluid").bind("dragleave", function () {
    if($("#btn-upload").length && !$('body').hasClass('shelforder')) {
        $(this).css('background', '');
    }
    return false;
});

// Syntax has to be bind not on, otherwise problems with firefox
$(".container-fluid").bind('drop', function (e) {
    e.preventDefault()
    e.stopPropagation();
    if($("#btn-upload").length) {
        var files = e.originalEvent.dataTransfer.files;
        var test = $("#btn-upload")[0].accept;
        $(this).css('background', '');
        const dt = new DataTransfer()
        jQuery.each(files, function (index, item) {
            if (test.indexOf(item.name.substr(item.name.lastIndexOf('.'))) !== -1) {
                dt.items.add(item);
            }
        });
        if (dt.files.length) {
            $("#btn-upload")[0].files = dt.files;
            $("#form-upload").submit();
        }
    }
});

$("#btn-upload").change(function() {
    $("#form-upload").submit();
});

$(document).ready(function() {
  var inp = $('#query').first()
  if (inp.length) {
    var val = inp.val()
    if (val.length) {
      inp.val('').blur().focus().val(val)
    }
  }
});

function ConfirmDialog(id, dataValue, yesFn, noFn) {
    var $confirm = $("#GeneralDeleteModal");
    // var dataValue= e.data('value'); // target.data('value');
    $confirm.modal('show');
    $.ajax({
        method:"get",
        dataType: "json",
        url: getPath() + "/ajax/loaddialogtexts/" + id,
        success: function success(data) {
            $("#header").html(data.header);
            $("#text").html(data.main);
        }
    });


    $("#btnConfirmYes").off('click').click(function () {
        yesFn(dataValue);
        $confirm.modal("hide");
    });
    $("#btnConfirmNo").off('click').click(function () {
        if (typeof noFn !== 'undefined') {
            noFn(dataValue);
        }
        $confirm.modal("hide");
    });
}

$("#delete_confirm").click(function() {
    //get data-id attribute of the clicked element
    var deleteId = $(this).data("delete-id");
    var bookFormat = $(this).data("delete-format");
    if (bookFormat) {
        window.location.href = getPath() + "/delete/" + deleteId + "/" + bookFormat;
    } else {
        if ($(this).data("delete-format")) {
            path = getPath() + "/ajax/delete/" + deleteId;
            $.ajax({
                method:"get",
                url: path,
                timeout: 900,
                success:function(data) {
                    data.forEach(function(item) {
                        if (!jQuery.isEmptyObject(item)) {
                            if (item.format != "") {
                                $("button[data-delete-format='"+item.format+"']").addClass('hidden');
                            }
                            $( ".navbar" ).after( '<div class="row-fluid text-center" style="margin-top: -20px;">' +
                                '<div id="flash_'+item.type+'" class="alert alert-'+item.type+'">'+item.message+'</div>' +
                                '</div>');

                        }
                    });
                }
            });
        } else {
            window.location.href = getPath() + "/delete/" + deleteId;

        }
    }

});

//triggered when modal is about to be shown
$("#deleteModal").on("show.bs.modal", function(e) {
    //get data-id attribute of the clicked element and store in button
    var bookId = $(e.relatedTarget).data("delete-id");
    var bookfomat = $(e.relatedTarget).data("delete-format");
    if (bookfomat) {
        $("#book_format").removeClass('hidden');
        $("#book_complete").addClass('hidden');
    } else {
        $("#book_complete").removeClass('hidden');
        $("#book_format").addClass('hidden');
    }
    $(e.currentTarget).find("#delete_confirm").data("delete-id", bookId);
    $(e.currentTarget).find("#delete_confirm").data("delete-format", bookfomat);
});



$(function() {
    var updateTimerID;
    var updateText;

    // Allow ajax prefilters to be added/removed dynamically
    // eslint-disable-next-line new-cap
    var preFilters = $.Callbacks();
    $.ajaxPrefilter(preFilters.fire);

    function restartTimer() {
        $("#spinner").addClass("hidden");
        $("#RestartDialog").modal("hide");
    }

    function cleanUp() {
        clearInterval(updateTimerID);
        $("#spinner2").hide();
        $("#DialogFinished").removeClass("hidden");
        $("#check_for_update").removeClass("hidden");
        $("#perform_update").addClass("hidden");
        $("#message").alert("close");
        $("#update_table > tbody > tr").each(function () {
            if ($(this).attr("id") !== "current_version") {
                $(this).closest("tr").remove();
            }
        });
    }

    function updateTimer() {
        $.ajax({
            dataType: "json",
            url: window.location.pathname + "/../../get_updater_status",
            success: function success(data) {
                // console.log(data.status);
                $("#DialogContent").html(updateText[data.status]);
                if (data.status > 6) {
                    cleanUp();
                }
            },
            error: function error() {
                $("#DialogContent").html(updateText[7]);
                cleanUp();
            },
            timeout: 2000
        });
    }

    function fillFileTable(path, type, folder, filt) {
        if (window.location.pathname.endsWith("/basicconfig")) {
            var request_path = "/../basicconfig/pathchooser/";
        } else {
            var request_path = "/../../ajax/pathchooser/";
        }
        $.ajax({
            dataType: "json",
            data: {
                path: path,
                folder: folder,
                filter: filt
            },
            url: window.location.pathname + request_path,
            success: function success(data) {
                if ($("#element_selected").text() ==="") {
                    $("#element_selected").text(data.cwd);
                }
                $("#file_table > tbody > tr").each(function () {
                    if ($(this).attr("id") !== "parent") {
                        $(this).closest("tr").remove();
                    } else {
                        if(data.absolute && data.parentdir !== "") {
                           $(this)[0].attributes['data-path'].value  = data.parentdir;
                        } else {
                            $(this)[0].attributes['data-path'].value  = "..";
                        }
                    }
                });
                if (data.parentdir !== "") {
                    $("#parent").removeClass('hidden')
                } else {
                    $("#parent").addClass('hidden')
                }
                // console.log(data);
                data.files.forEach(function(entry) {
                    if(entry.type === "dir") {
                        var type = "<span class=\"glyphicon glyphicon-folder-close\"></span>";
                } else {
                    var type = "";
                }
                    $("<tr class=\"tr-clickable\" data-type=\"" + entry.type + "\" data-path=\"" +
                        entry.fullpath + "\"><td>" + type + "</td><td>" + entry.name + "</td><td>" +
                        entry.size + "</td></tr>").appendTo($("#file_table"));
                });
            },
            timeout: 2000
        });
    }

    $(".discover .row").isotope({
        // options
        itemSelector : ".book",
        layoutMode : "fitRows"
    });

    $(".grid").isotope({
        // options
        itemSelector : ".grid-item",
        layoutMode : "fitColumns"
    });

    if ($(".load-more").length && $(".next").length) {
        var $loadMore = $(".load-more .row").infiniteScroll({
            debug: false,
            // selector for the paged navigation (it will be hidden)
            path : ".next",
            // selector for the NEXT link (to page 2)
            append : ".load-more .book"
            //animate      : true, # ToDo: Reenable function
            //extraScrollPx: 300
        });
        $loadMore.on( "append.infiniteScroll", function( event, response, path, data ) {
            if ($("body").hasClass("blur")) {
                $(".pagination").addClass("hidden").html(() => $(response).find(".pagination").html());
            }
            $(".load-more .row").isotope( "appended", $(data), null );
        });

        // fix for infinite scroll on CaliBlur Theme (#981)
        if ($("body").hasClass("blur")) {
            $(".col-sm-10").bind("scroll", function () {
                if (
                    $(this).scrollTop() + $(this).innerHeight() >=
                    $(this)[0].scrollHeight
                ) {
                    $loadMore.infiniteScroll("loadNextPage");
                    window.history.replaceState({}, null, $loadMore.infiniteScroll("getAbsolutePath"));
                }
            });
        }
    }

    $("#restart").click(function() {
        $.ajax({
            dataType: "json",
            url: window.location.pathname + "/../../shutdown",
            data: {"parameter":0},
            success: function success() {
                $("#spinner").show();
                setTimeout(restartTimer, 3000);
            }
        });
    });
    $("#shutdown").click(function() {
        $.ajax({
            dataType: "json",
            url: window.location.pathname + "/../../shutdown",
            data: {"parameter":1},
            success: function success(data) {
                return alert(data.text);
            }
        });
    });
    $("#check_for_update").click(function() {
        var $this = $(this);
        var buttonText = $this.html();
        $this.html("...");
        $("#DialogContent").html("");
        $("#DialogFinished").addClass("hidden");
        $("#update_error").addClass("hidden");
        if ($("#message").length) {
            $("#message").alert("close");
        }
        $.ajax({
            dataType: "json",
            url: window.location.pathname + "/../../get_update_status",
            success: function success(data) {
                $this.html(buttonText);

                var cssClass = "";
                var message = "";

                if (data.success === true) {
                    if (data.update === true) {
                        $("#check_for_update").addClass("hidden");
                        $("#perform_update").removeClass("hidden");
                        $("#update_info")
                            .removeClass("hidden")
                            .find("span").html(data.commit);

                        data.history.forEach(function(entry) {
                            $("<tr><td>" + entry[0] + "</td><td>" + entry[1] + "</td></tr>").appendTo($("#update_table"));
                        });
                        cssClass = "alert-warning";
                    } else {
                        cssClass = "alert-success";
                    }
                } else {
                    cssClass = "alert-danger";
                }

                message = "<div id=\"message\" class=\"alert " + cssClass
                    + " fade in\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\">&times;</a>"
                    + data.message + "</div>";

                $(message).insertAfter($("#update_table"));
            }
        });
    });
    $("#restart_database").click(function() {
        $("#DialogHeader").addClass("hidden");
        $("#DialogFinished").addClass("hidden");
        $("#DialogContent").html("");
        $("#spinner2").show();
        $.ajax({
            dataType: "json",
            url: window.location.pathname + "/../../shutdown",
            data: {"parameter":2},
            success: function success(data) {
                $("#spinner2").hide();
                $("#DialogContent").html(data.text);
                $("#DialogFinished").removeClass("hidden");
            }
        });
    });
    $("#perform_update").click(function() {
        $("#DialogHeader").removeClass("hidden");
        $("#spinner2").show();
        $.ajax({
            type: "POST",
            dataType: "json",
            data: { start: "True"},
            url: window.location.pathname + "/../../get_updater_status",
            success: function success(data) {
                updateText = data.text;
                $("#DialogContent").html(updateText[data.status]);
                // console.log(data.status);
                updateTimerID = setInterval(updateTimer, 2000);
            }
        });
    });

    // Init all data control handlers to default
    $("input[data-control]").trigger("change");
    $("select[data-control]").trigger("change");
    $("select[data-controlall]").trigger("change");

    $("#bookDetailsModal")
        .on("show.bs.modal", function(e) {
            var $modalBody = $(this).find(".modal-body");

            // Prevent static assets from loading multiple times
            var useCache = function(options) {
                options.async = true;
                options.cache = true;
            };
            preFilters.add(useCache);

            $.get(e.relatedTarget.href).done(function(content) {
                $modalBody.html(content);
                preFilters.remove(useCache);
            });
        })
        .on("hidden.bs.modal", function() {
            $(this).find(".modal-body").html("...");
        });

    $("#modal_kobo_token")
        .on("show.bs.modal", function(e) {
            var $modalBody = $(this).find(".modal-body");

            // Prevent static assets from loading multiple times
            var useCache = function(options) {
                options.async = true;
                options.cache = true;
            };
            preFilters.add(useCache);

            $.get(e.relatedTarget.href).done(function(content) {
                $modalBody.html(content);
                preFilters.remove(useCache);
            });
        })
        .on("hidden.bs.modal", function() {
            $(this).find(".modal-body").html("...");
            $("#config_delete_kobo_token").show();
        });

    $("#config_delete_kobo_token").click(function() {
        ConfirmDialog(
            $(this).attr('id'),
            $(this).data('value'),
            function (value) {
                $.ajax({
                    method: "get",
                    url: getPath() + "/kobo_auth/deleteauthtoken/" + value,
                });
                $("#config_delete_kobo_token").hide();
            }
        );
    });

    $("#toggle_order_shelf").click(function() {
        $("#new").toggleClass("disabled");
        $("#old").toggleClass("disabled");
        $("#asc").toggleClass("disabled");
        $("#desc").toggleClass("disabled");
        $("#auth_az").toggleClass("disabled");
        $("#auth_za").toggleClass("disabled");
        $("#pub_new").toggleClass("disabled");
        $("#pub_old").toggleClass("disabled");
        var alternative_text = $("#toggle_order_shelf").data('alt-text');
        $("#toggle_order_shelf")[0].attributes['data-alt-text'].value = $("#toggle_order_shelf").html();
        $("#toggle_order_shelf").html(alternative_text);
    });

    $("#btndeluser").click(function() {
        ConfirmDialog(
            $(this).attr('id'),
            $(this).data('value'),
            function(value){
                var subform = $('#user_submit').closest("form");
                subform.submit(function(eventObj) {
                    $(this).append('<input type="hidden" name="delete" value="True" />');
                    return true;
                });
                subform.submit();
            }
        );
    });
    $("#user_submit").click(function() {
        this.closest("form").submit();
    });

    $("#delete_shelf").click(function() {
        ConfirmDialog(
            $(this).attr('id'),
            $(this).data('value'),
            function(value){
                window.location.href = window.location.pathname + "/../../shelf/delete/" + value
            }
        );

    });


    $("#fileModal").on("show.bs.modal", function(e) {
        var target = $(e.relatedTarget);
        var path = $("#" + target.data("link"))[0].value;
        var folder = target.data("folderonly");
        var filter = target.data("filefilter");
        $("#element_selected").text(path);
        $("#file_confirm")[0].attributes["data-link"].value = target.data("link");
        $("#file_confirm")[0].attributes["data-folderonly"].value = (typeof folder === 'undefined') ? false : true;
        $("#file_confirm")[0].attributes["data-filefilter"].value = (typeof filter === 'undefined') ? "" : filter;
        $("#file_confirm")[0].attributes["data-newfile"].value = target.data("newfile");
        fillFileTable(path,"dir", folder, filter);
    });

    $("#file_confirm").click(function() {
        $("#" + $(this).data("link"))[0].value = $("#element_selected").text()
    });

    $(document).on("click", ".tr-clickable", function() {
        var path = this.attributes["data-path"].value;
        var type = this.attributes["data-type"].value;
        var folder = $(file_confirm).data("folderonly");
        var filter = $(file_confirm).data("filefilter");
        var newfile = $(file_confirm).data("newfile");
        if (newfile !== 'undefined') {
            $("#element_selected").text(path + $("#new_file".text()));
        } else {
            $("#element_selected").text(path);
        }
        if(type === "dir") {
            fillFileTable(path, type, folder, filter);
        }
    });

    $(window).resize(function() {
        $(".discover .row").isotope("layout");
    });

    $("#import_ldap_users").click(function() {
        $("#DialogHeader").addClass("hidden");
        $("#DialogFinished").addClass("hidden");
        $("#DialogContent").html("");
        $("#spinner2").show();
        $.ajax({
            method:"get",
            dataType: "json",
            url: getPath() + "/import_ldap_users",
            success: function success(data) {
                $("#spinner2").hide();
                $("#DialogContent").html(data.text);
                $("#DialogFinished").removeClass("hidden");
            }
        });
    });

    $(".author-expand").click(function() {
        $(this).parent().find("a.author-name").slice($(this).data("authors-max")).toggle();
        $(this).parent().find("span.author-hidden-divider").toggle();
        $(this).html() === $(this).data("collapse-caption") ? $(this).html("(...)") : $(this).html($(this).data("collapse-caption"));
        $(".discover .row").isotope("layout");
    });

    $(".update-view").click(function(e) {
        var view = $(this).data("view");

        e.preventDefault();
        e.stopPropagation();
        $.ajax({
            method:"post",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            url: window.location.pathname + "/../../ajax/view",
            data: "{\"series\": {\"series_view\": \""+ view +"\"}}",
            success: function success() {
                location.reload();
            }
        });
    });
});
