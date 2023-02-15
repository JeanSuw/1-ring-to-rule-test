// Darryll
var bookInput = document.querySelector("#book-text");
var bookList = document.querySelector("#book-list"); 
//var bookList = document.querySelector("#page-number");
// The book-list id or class does not exist in html, where should we put it
var bookCountSpan = document.querySelector("#book-count");
var books = [];

//var pageNumber = document.getElementById('page-number');
var pageNumber = $('#page-number');

// totalNumberOfPages will be a concatonation of the book collection
var totalNumberOfPages = 0;
var listofBooksPages = []; // for calculateTimeframe
var bookTitle = "";
// can be changed later to diffent speeds
var readingSpeed = 30; // Total number of page per hour
 
// book selection in search
var selectedBook = $('#txtBookSearch');

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
                        // add from Jay's code
                        if (item.volumeInfo.title && item.volumeInfo.pageCount){
                            totalNumberOfPages = item.volumeInfo.pageCount;
                        }
                        
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
                                // add from Jay's code
                                pages: item.volumeInfo.pageCount,
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
                //var isbnKey = "ISBN:"+ String(ui.item.isbn[0].identifier);
                var getPageNumber = function(){
                    // add from Jay's code
                    getpokemonImage();
                    var pageNumber = $('#page-number');
                    var rowHTML = "<tr><td>" + ui.item.title + "</td><td>" + ui.item.pages + "</td></tr>";
                    console.log(rowHTML);
                    pageNumber.html(pageNumber.html() + rowHTML);

                    // Unused Feature 
                    //listofBooksPages.push(ui.item.pages);
                    //calculateTimeframe(listofBooksPages);
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

                //var bookText = ui.item.title + ui.item.pages;
                var bookText = {
                    btitle: ui.item.title,
                    bPage: ui.item.pages
                };
                console.log(bookText);
                console.log(books);
                books.push(bookText);
                
                storeBooks();
                renderBooks();
                // isbnNum.textContent = "Inside checkISBN: " + selectedURL.substring(42,60);
            },
            minLength: 5 // set minimum length of text the user must enter
        });
    });  
    // Bryan's
    function getpokemonImage() {
        var pokeDex = String(Math.floor(Math.random() * 808));
        fetch('https://pokeapi.co/api/v2/pokemon/'+pokeDex+'/').then((response) => response.json()).then((data) => {
            console.log(data);
            var pokeimage = document.createElement('img');
            pokeimage.src = data.sprites.front_default;
            console.log (data.sprites.front_default);
            
            
            document.querySelector("#pokemonImage").append(pokeimage);
            // document.querySelector("#page-number").append(pokeimage)
            
        }).catch((err) => {
            console.log('pokemon not found', err);
        })
    }
    function renderBooks(){
        for (var i = 0; i < books.length; i++) {
            var book = books[i].btitle;
            var pageHistory = books[i].bPage;

            var li = document.createElement("page-number");
            
            li.setAttribute("data-index", i);
            pageNumber.append("<tr><td>" + book + "</td><td>" + pageHistory + "</td></tr>");
        }
    }
    // function renderBooks() {
    //     // Clear bookList element and update bookCountSpan
    //     //bookList.innerHTML = "";
    //     if (books.length === null ){ 
    //         // if caught the errors, set bookCountSpan.textContent to 0 
    //         bookCountSpan.textContent = 0;
    //     }else{
    //         console.log("check length: " + books.length);
    //         bookCountSpan.textContent = books.length;
    //     }
        
      
    //     // Render a new li for each book
    //     for (var i = 0; i < books.length; i++) {
    //       var book = books[i].btitle;
      
    //       var li = document.createElement("li");
    //       li.textContent = book;
    //       li.setAttribute("data-index", i);
      
    //       var button = document.createElement("button");
    //       button.textContent = "Delete ❌";
      
    //       li.appendChild(button);
    //       bookList.appendChild(li);
    //     }
    // }
    // Calls init to retrieve data and render it to the page on load
    init()
    // Add click event to bookList element
    function init() {
        // Get stored books from localStorage
        var storedBooks = JSON.parse(localStorage.getItem("books"));
        
        // If books were retrieved from localStorage, update the books array to it
        if (storedBooks !== null) {
            books = storedBooks;
        }
        console.log("inside books: " + books);
        console.log("length " + books.length);
        renderBooks();
    }

    function storeBooks() {
        // Stringify and set key in localStorage to books array
      localStorage.setItem("books", JSON.stringify(books));
    }
    bookList.addEventListener("click", function(event) {
        var element = event.target;
        
        // Checks if element is a button
        if (element.matches("button") === true) {
          // Get its data-index value and remove the book element from the list
          var index = element.parentElement.getAttribute("data-index");
          books.splice(index, 1);
          
          // Store updated books in localStorage, re-render the list
          storeBooks();
          renderBooks();
        }
    });