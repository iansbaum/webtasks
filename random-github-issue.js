var GitHubApi = require('github');

module.exports = function (ctx, done) {
    var github = new GitHubApi({
        version: "3.0.0",
        protocol: "https",
        host: "api.github.com",
        headers: {
            "user-agent": "ianbaum_test_webtask_app"
        },
        timeout: 5000
    });

    var query = "state:open+type:issue+label:up-for-grabs";
    if (ctx.data.language !== undefined) {
        query += "+language:" + ctx.data.language;
    }

    github.search.issues({
        q: query,
        page: 1,
        per_page: 1
    }, function (err, res) {
        // err will be null if there is no error
        if (err == undefined) {
            if (res.total_count == 0) {
                error = new Error("No issues found");
                return error
            }
            getRandomIssue(res);
        } else {
            error = new Error("Error searching issues: " + err);
            return error;
        }
    });

    function getRandomIssue(res) {
        // GitHub Api restricts to 1000 results. If we find more than that, only 
        // look at the first 1000
        var count = res.total_count < 1000 ? res.total_count : 1000;
        var place = Math.floor(Math.random() * (count - 1)) + 1;
        var page = Math.floor(place/30);
        var page_place = place % 30;

        github.search.issues({
            q: query,
            page: page
        }, function (err, res) {
            if (err != undefined) {
                error = new Error("Error querying for specific issues: " + err);
                return error;
            } else {
                var issue = res.items[page_place];
                var results = {
                    "title": issue.title,
                    "url": issue.html_url
                }
                done(null, results);
            }
        });
    }
};
