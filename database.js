var db = openDatabase('c2opds', '1.0', 'Calibre2Opds DB, enabling search feature', 2 * 1024 * 1024);
var default_number_of_keywords = 100;
var v_booksLoaded = false;
var v_keywordsLoaded = false;
var v_catalogItemsLoaded = false;
var booksd = new Map();
var kwd = new Map();

function createAndPopulateDB() {
    loadDb();
}

function loadDb() {
    console.log("Reloading database");
 
    loadJs("database/books.js", booksLoaded);
    loadJs("database/keywords.js", keywordsLoaded);
    loadJs("database/catalogitems.js", catalogItemsLoaded);

    loadWithTimer(1000, 10);

}


function loadJs(relativePath, callback) {
    let script = document.createElement('SCRIPT');
    script.setAttribute('src', relativePath);

    let oHead = document.getElementsByTagName('HEAD')[0];
    let oScript = document.createElement('script');
    oScript.type = 'text/javascript';
    oScript.src = relativePath;
    // most browsers
    oScript.onload = function () {
        callback();
    }
    oHead.appendChild(oScript);
}

function booksLoaded() {
    v_booksLoaded = true;
}

function keywordsLoaded() {
    v_keywordsLoaded = true;
}

function catalogItemsLoaded() {
    v_catalogItemsLoaded = true;
}


function loadWithTimer(timer, howManyTimes) {

    if (v_booksLoaded && v_keywordsLoaded && v_catalogItemsLoaded) {
        loadBooks();
        loadKeywords();
        loadCatalogItems();
        getKeywordsWithSize(document.getElementById('tag_cloud'),'');
    } else {
        if (howManyTimes == 0) {
            alert("Could not execute load");
            return;
        } else {
            var value = howManyTimes - 1;
            setTimeout("loadWithTimer('timer','value')");
        }
    }


}


function loadBooks() {
    let books = getBooks();
    books = books.map((x) => [parseInt(x[0]), x[1], x[2], x[3]]);

    for (let i = 0; i < books.length; i++) {
        BK_ID = books[i][0];
        booksd.set(BK_ID, {
            BK_TITLE: books[i][1],
            BK_URL: books[i][2],
            BK_THUMBNAIL_URL: books[i][3]
        });
    }

}


function loadKeywords() {
    let kw = getKeywords();
    kw = kw.map((x) => [parseInt(x[0]), x[1], parseInt(x[2])]);
    kw = kw.sort((x, y) => y[2] - x[2]);

    for (let i = 0; i < kw.length; i++) {
        KW_ID = kw[i][0];
        kwd.set(KW_ID, {
            KW_WORD: kw[i][1],
            KW_WEIGHT: kw[i][2],
            BK_IDS: []
        });
    }

}

function loadCatalogItems() {
    let catalog = getCatalogitems();
    //removed last element found no use x[2]
    catalog = catalog.map((x) => [parseInt(x[0]), parseInt(x[1])]);
    console.log(catalog.length);
    catalog = [...new Set(catalog.map(x => x[0] + "-" + x[1]))].map(s => s.split("-").map(x => parseInt(x)))
    console.log(catalog);

    for (let i = 0; i < catalog.length; i++) {
        [KW_ID, BK_ID] = catalog[i];

        let t = kwd.get(KW_ID);
        if (t === undefined) {
            console.log(i, KW_ID, BK_ID);
        } else {
            // console.log("pushing at", KW_ID, BK_ID);
            kwd.get(KW_ID).BK_IDS.push(BK_ID);
        }

    }


}


function searchByKeywordId(kw_id, element) {
    kw_id = parseInt(kw_id);

    cleanSearch();
    element.innerHTML = "No result...";

    if (kwd.get(kw_id) != undefined) {
        let html = "";
        BK_IDS = kwd.get(kw_id).BK_IDS;
        for (let i = 0; i < BK_IDS.length; i++) {
            BK_ID = BK_IDS[i];
            let bookId = BK_ID;
            let bookUrl = booksd.get(BK_ID).BK_URL;
            let bookTitle = booksd.get(BK_ID).BK_TITLE;
            let bookThumbnailUrl = booksd.get(BK_ID).BK_THUMBNAIL_URL;
            html += "<a href='" + bookUrl + "' title=\"" + bookTitle + "\" target='_new'><img src='" + bookThumbnailUrl + "'></a> &nbsp;";
        }
        element.innerHTML = html;
    } else {
        console.log("kw_id not found in kwd", kw_id);
    }
}

var level_10;
var level_9;
var level_8;
var level_7;
var level_6;
var level_5;
var level_4;
var level_3;
var level_2;
var level_1;

var diff;
var dist;

function getKeywordsWithSize(element, word) {
    cleanSearch();
    element.innerHTML = "";

    let keywords = [];
    let counter = 0;
    let keys = [...kwd.keys()]
    for (let i = 0; i < keys.length; i++) {
        if (counter >= default_number_of_keywords) {
            break;
        }
        let KW_ID = keys[i];
        let KW_WORD = kwd.get(KW_ID).KW_WORD;

        if (KW_WORD.includes(word)) {
            counter += 1
            let KW_WEIGHT = kwd.get(KW_ID).KW_WEIGHT;
            keywords.push([KW_ID, KW_WORD, KW_WEIGHT]);

        }

    }

    if (keywords.length != 0) {
        level_10 = keywords[0][2];
        level_1 = keywords[keywords.length - 1][2];

        diff = level_10 - level_1;
        dist = diff / 7;

        level_9 = 1 + (dist * 6);
        level_8 = 1 + (dist * 5);
        level_7 = 1 + (dist * 4);
        level_6 = 1 + (dist * 3);
        level_5 = 1 + (dist * 2);
        level_4 = 1 + dist;
        level_3 = 1 + (dist / 2);
        level_2 = 1 + (dist / 4);

        //Let's display the tag_cloud trying to order by words ...
        // WHHY IS this sorted ? by KW_ID ? - arjun
        keywords.sort();

        let tagClouds = ""
        for (let i = 0; i < keywords.length; i++) {
            let size = getTagClass(keywords[i][2]);
            tagClouds += "<a href=\"#\" onclick=\"searchByKeywordId('" + keywords[i][0] + "',document.getElementById('searchResult'))\" class='" + size + "'>" + keywords[i][1] + "</a> &nbsp;";
        }
        element.innerHTML = "<p>" + tagClouds + "</p>";
    }



}

function cleanSearch() {
    document.getElementById("searchResult").innerHTML = "";
}

function getTagClass(z) {
    let tagClass = "";

    if (z == level_10) {
        tagClass = "level10Tag";
    } else if (z >= level_9) {
        tagClass = "level9Tag";
    } else if (z >= level_8) {
        tagClass = "level8Tag";
    } else if (z >= level_7) {
        tagClass = "level7Tag";
    } else if (z >= level_6) {
        tagClass = "level6Tag";
    } else if (z >= level_5) {
        tagClass = "level5Tag";
    } else if (z >= level_4) {
        tagClass = "level4Tag";
    } else if (z >= level_3) {
        tagClass = "level3Tag";
    } else if (z >= level_2) {
        tagClass = "level2Tag";
    } else if (z >= level_1) {
        tagClass = "level1Tag";
    } else {
        tagClass = "unkwnown";
    }
    return tagClass;
}