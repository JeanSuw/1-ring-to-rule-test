var pageNumber = document.getElementById('page-number');


// totalNumberOfPages will be a concatonation of the book collection
var totalNumberOfPages = [];
// can be changed later to diffent speeds
var readingSpeed = 30; // Total number of page per hour
var readingDays = totalNumberOfPages/readingSpeed  
// book selection in search
var selectedBook = $('#txtBookSearch');

// https://openlibrary.org/api/books?bibkeys={ISBN:9780980200447}&jscmd=data&format=json
// Must be "ISBN:00000000000000"

$(document).ready(function () {  // only begin once page has loaded
    $("#txtBookSearch").autocomplete({ // attach auto-complete functionality to textbox
        // define source of the data
        source: function (request, response) {
            // url link to google books, including text entered by user (request.term)
            var booksUrl = "https://www.googleapis.com/books/v1/volumes?printType=books&q=" + encodeURIComponent(request.term);
            $.ajax({
                url: booksUrl,
                dataType: "jsonp",
                success: function(data) {
                    response($.map(data.items, function (item) {
                        if (item.volumeInfo.authors && item.volumeInfo.title && item.volumeInfo.industryIdentifiers && item.volumeInfo.publishedDate)
                        {
                            return {
                                // label value will be shown in the suggestions
                                label: item.volumeInfo.title + ', ' + item.volumeInfo.authors[0] + ', ' + item.volumeInfo.publishedDate,
                                // value is what gets put in the textbox once an item selected
                                value: item.volumeInfo.title,
                                // other individual values to use later
                                title: item.volumeInfo.title,
                                author: item.volumeInfo.authors[0],
                                isbn: item.volumeInfo.industryIdentifiers,
                                publishedDate: item.volumeInfo.publishedDate,
                                image: (item.volumeInfo.imageLinks == null ? "" : item.volumeInfo.imageLinks.thumbnail),
                                description: item.volumeInfo.description,
                            };
                        }
                    }));
                }
            });
        },
        select: function (event, ui) {
            // what to do when an item is selected
            // first clear anything that may already be in the description
            $('#divDescription').empty();
            // we get the currently selected item using ui.item
            // show a pic if we have one
            // if (item.image != '')
            // {
                //     $('#divDescription').append('<img src="' + ui.item.image + '" style="float: left; padding: 10px;">');
                // }
                // and title, author, and year
                $('#divDescription').append('<p><b>Title:</b> ' + ui.item.title  + '</p>');
                $('#divDescription').append('<p><b>Author:</b> ' + ui.item.author  + '</p>');
                $('#divDescription').append('<p><b>First published year:</b> ' + ui.item.publishedDate  + '</p>');          
                // and the usual description of the book
                $('#divDescription').append('<p><b>Description:</b> ' + ui.item.description  + '</p>');
                // and show the link to oclc (if we have an isbn number)
                if (ui.item.isbn && ui.item.isbn[0].identifier)
                {
                    $('#divDescription').append('<P><b>ISBN:</b> ' + ui.item.isbn[0].identifier + '</p>');
                    $('#divDescription').append('<a href="http://www.worldcat.org/isbn/' + ui.item.isbn[0].identifier + '" target="_blank">View item on worldcat</a>');
                }
                var isbnKey = "ISBN:"+ String(ui.item.isbn[0].identifier);
                var getPageNumber = function(){
                    var apiUrl = "https://openlibrary.org/api/books?bibkeys="+isbnKey+"&jscmd=data&format=json";
                    fetch(apiUrl)
                    
                    .then(function(response){
                        return response.json();
                        })
                        .then(function(data){
                            // Jean's version
                            var rowHTML;
                            var pageNumber = $('#page-number');
                            var bookISBN = data[isbnKey];

                            if (bookISBN.number_of_pages === undefined){
                                rowHTML = "<tr><td>" + data[isbnKey].title + "</td><td>" + data[isbnKey].pagination + "</td></tr>";
                            }else if (bookISBN.pagination === undefined){
                                rowHTML = "<tr><td>" + data[isbnKey].title + "</td><td>" + bookISBN.number_of_pages + "</td></tr>";
                            }else{
                                rowHTML = "<tr><td>" + data[isbnKey].title + "</td><td>" + 0 + "</td></tr>";
                            }
                            pageNumber.append(rowHTML);

                            calculateTimeframe(totalNumberOfPages);
                        });
                    console.log(apiUrl)
                }
                
                function calculateTimeframe(pageList){
                    var timeFrame = [];
                    var hrPerDayList = [];
                    
                    // This loop is for converting undefined value in pageList to 0
                    for (var i = 0; i < pageList.length; i++){
                        if (pageList[i] === undefined){
                            timeFrame.push(0); // If the book does not have page number add 0 for now
                        }
                        console.log("pageList element type is " + pageList[i]);
                        console.log(typeof pageList[i]); // check the type pagelist if we need to convert it to number parseInt()
                        timeFrame.push(parseInt(pageList[i]));
                    }
                    let sumOfPages = Number();
                    
                    // Added all the pages the reader need to read
                    for (var j = 0; j < pageList.length; j++){
                        sumOfPages += timeFrame[j];
                    }
                    // Reading speed calculation
                    var readingDays = sumOfPages/readingSpeed;
                    
                    // hrs per days in each weeks
                    for (var numDays = 1; numDays < 8; numDays++){
                        // assigned how many hours the reader wants to read
                        var speedPerDay = readingDays/numDays;
                        hrPerDayList.push(speedPerDay.toFixed(2));
                    }
                    
                    $("#time-frame-content").append
                    (
                        '<p>Read books within a week</p>'
                        + '<p>7 days: '+ hrPerDayList[hrPerDayList.length-1] + ' hrs </p>'
                        + '<p>6 days: '+ hrPerDayList[hrPerDayList.length-2] + ' hrs </p>'
                        + '<p>5 days: '+ hrPerDayList[hrPerDayList.length-3] + ' hrs </p>'
                        + '<p>4 days: '+ hrPerDayList[hrPerDayList.length-4] + ' hrs </p>'
                        + '<p>3 days: '+ hrPerDayList[hrPerDayList.length-5] + ' hrs </p>'
                        + '<p>2 days: '+ hrPerDayList[hrPerDayList.length-6] + ' hrs </p>'
                        + '<p>1 day: '+ hrPerDayList[hrPerDayList.length-7] + ' hrs </p>'
                    );
                }

                getPageNumber();
                console.log(isbnKey);
            },
            minLength: 5 // set minimum length of text the user must enter
        });
    });  
   