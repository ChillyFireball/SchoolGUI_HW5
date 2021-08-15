/*
    File: script.js
    GUIAssignment: Implementing a Bit of Scrabble with Drag-and-Drop
    Haley Santomas, UMass Lowell Computer Science, haley_santomas@student.uml.edu
    Date: 8/10/2021
    Summary: The JavaScript for a Scrabble game. Full feature details are provided in the README, but to sum up, this file contains 90% of the functions that
    make the game work, including drag-and-drop, scoring, and tile management.

    Sources:
        1) Scrabble_Pieces_AssociativeArray_Jesse.js
        Used the associative array.
        2) https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
        Used the function to get a random inclusive integer (getRandomIntInclusive).
*/

/***** CONSTANTS *****/
const MAX_NUM_PIECES = 7;
const BOARD_LENGTH = 15;

/***** GLOBALS *****/
var piecesOnRack = new Array();
var piecesOnBoard = new Array(BOARD_LENGTH);

/***** SETTINGS *****/

/***** DOCUMENT READY *****/
$(document).ready()
{
    // Make droppable.
    $("div.snapSlot").droppable({
        accept: "img.letterPiece",
        drop: function(event, ui) // When dropped...
        {

            console.log("Dropped " + ui.draggable.attr("id") + ": " + ui.draggable.attr("data-letter"));

            // Add the letter to the piecesOnBoard array.
            piecesOnBoard[ parseInt($(this).attr("data-index")) ] = ui.draggable.attr("data-letter");

            // Remove letter from piecesOnRack array.
            var tempRack = new Array();
            var removedYet = false; // Use this to make sure we only remove one element of a particular value and not multiple.
            for(var i = 0; i < piecesOnRack.length; i++)
            {
                // If this is not the piece we're removing, push to the new stack.
                if(piecesOnRack[i] != ui.draggable.attr("data-letter"))
                    tempRack.push(piecesOnRack[i]);
                // If this IS the piece we're removing, push if it's already been removed.
                else if(removedYet)
                    tempRack.push(piecesOnRack[i]);
                // If this IS the piece we're removing and it hasn't been removed yet, set removedYet to true.
                else
                    removedYet = true;
            }
            piecesOnRack = tempRack;

            // Update Word Score.
            // a) Get letter score (base letter score * this tile's multiplier).
            var baseLetterScore = parseInt( ScrabbleTiles[ui.draggable.attr("data-letter")]["value"] );
            var letterScore = baseLetterScore * parseInt( $(this).attr("data-letterMultiplier") );
            var totalLetterScore = letterScore += parseInt( $("span#wordBaseScore").html() );

            $("span#wordBaseScore").html(totalLetterScore);

            // b) Check for word multiplier.
            var currentMultiplier = parseInt( $("span#wordScoreMultiplier").html() );
            currentMultiplier *= parseInt( $(this).attr("data-wordMultiplier") );

            $("span#wordScoreMultiplier").html( currentMultiplier );

            // c) Update word score.
            var currentWordScore = totalLetterScore * currentMultiplier;
            $("span#wordScore").html(currentWordScore);

            // Make element no longer draggable.
            //ui.draggable.draggable("disable");

            // Insert an identical, undraggable image into this div and delete the draggable tile.
            var imageFileLocation = ui.draggable.attr("src");
            $(this).html("<img src='" + imageFileLocation + "' alt='Tile' class='boardLetter'>");
            ui.draggable.remove();

            // Make it so nothing else can be dropped here.
            $(this).droppable("option", "disabled", true);

            // Disable droppability on every other droppable tile.
            $(".snapSlot").droppable("option", "disabled", true);

            // Enable droppability on indexes adjecent to the word.
            var indexCurrent = parseInt( $(this).attr("data-index") );

            var indexLeft = indexCurrent - 1;
            while(typeof piecesOnBoard[indexLeft] != 'undefined')
            {
                indexLeft--;
            }
            var indexRight = indexCurrent + 1;
            while(typeof piecesOnBoard[indexRight] != 'undefined')
            {
                indexRight++;
            }
            $(".snapSlot").each(function(i, obj)
                {
                    if(parseInt( $(obj).attr("data-index") ) == indexLeft || parseInt( $(obj).attr("data-index") ) == indexRight )
                        $(obj).droppable("option", "disabled", false);
                });
        }
    });

    // Set some tool tips for the buttons.
    $("button#newTiles").attr("title", "Give up and draw 7 new tiles if you're stuck.");
    $("button#submit").attr("title", "Submit the current word.");
    $("button#startOver").attr("title", "Start a new game.");

    // Draw pieces.
    drawAllPieces();
}

function getRandomIntInclusive(min, max)
{
    // Source 2: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function drawAllPieces()
{
    // Discard previous pieces if they existed.
    discardAllPieces();

    // Reset word score, but leave Total Score.
    $("span#wordScore").html("0");
    $("span#wordBaseScore").html("0");
    $("span#wordScoreMultiplier").html("1");

    // Draw 7 pieces.
    drawNPieces(MAX_NUM_PIECES);

    // Make droppable slots droppable again.
    $(".snapSlot").droppable("option", "disabled", false);
}

function drawNPieces(n)
{
    // Determine the number of remaining pieces.
    var numPiecesRemaining = 0;
    for(var index in ScrabbleTiles)
    {
        numPiecesRemaining += ScrabbleTiles[index]["number-remaining"];
    }

    // If the number of pieces remaining is less than n, set n to numPiecesRemaining.
    if(numPiecesRemaining < n)
        n = numPiecesRemaining;
    
    // Decide which n pieces to draw.
    for(var i = 0; i < n; i++)
    {
        // Select a random number from 1 to the number of pieces remaining.
        var randomPieceNumber = getRandomIntInclusive(1, numPiecesRemaining);

        var selectedPiece;

        // Go through pieces until that value is reached.
        for(var index in ScrabbleTiles)
        {
            // Subtract the remaining pieces of this type from randomPieceNumber.
            randomPieceNumber -= ScrabbleTiles[index]["number-remaining"];
            
            // If randomPieceNumber is <= 0, set the selectedPiece to the index,
            // subtract one from number-remaining, and break.
            // Otherwise, we continue to the next possible piece.
            if(randomPieceNumber <= 0)
            {
                selectedPiece = index;
                ScrabbleTiles[index]["number-remaining"]--;
                break;
            }
        }

        // Add selected piece to available pieces.
        piecesOnRack.push(selectedPiece);
    }

    // Display the drawn pieces.
    displayPieces();
}

// Discards all pieces in piecesInRack array and removes them from the screen.
function discardAllPieces()
{
    // Empty all piece arrays.
    piecesOnRack = new Array();
    piecesOnBoard = new Array(BOARD_LENGTH);

    // Clear all old pieces.
    $("img.letterPiece").remove();
    $("img.boardLetter").remove();
}

// Only clears pieces on the board.
function clearBoard()
{
    // Empty board array.
    piecesOnBoard = new Array(BOARD_LENGTH);

    // Remove board pieces.
    $("img.letterPiece").remove();

    // Remove HTML in snapSlot.
    $("div.snapSlot").html("");
}

// Shows all pieces in the piecesInRack array on the screen.
function displayPieces()
{
    // Generate the piece elements.
    for(var i = 0; i < piecesOnRack.length; i++)
    {
        var pieceElements = "<img ";

        pieceElements += "id='tile" + i + "' "; // Assign unique tile ID.
        
        pieceElements += "class='letterPiece' src='graphics_data/Scrabble_Tiles/Scrabble_Tile_"; // Class and image location.

        // Select the image of the letter.
        if(piecesOnRack[i] != "_")
            pieceElements += piecesOnRack[i];
        else
            pieceElements += "Blank";

        pieceElements += ".jpg' ";

        pieceElements += "data-letter='" + piecesOnRack[i] + "'>"; // Store letter data.

        // Append.
        $("#tileRack").append(pieceElements);

        // Make draggable.
        $("img.letterPiece").draggable({
            snap: ".snapSlot",
            snapMode: "inner",
            revert: true
        });
    }
}

function submit()
{
    // Extract word from piecesOnBoard.
    var extractedString = "";

    // Check that word exists.

    // Tally up points.
    var totalScore = parseInt( $("span#totalScore").html() );
    var wordScore = parseInt( $("span#wordScore").html() );
    $("span#totalScore").html(totalScore + wordScore);

    // Reset word score.
    $("span#wordBaseScore").html(0);
    $("span#wordScoreMultiplier").html(1);
    $("span#wordScore").html(0);

    // Discard pieces on board.
    clearBoard();

    // Refill pieces.
    drawNPieces(MAX_NUM_PIECES - piecesOnRack.length);

    // Make droppable slots droppable again.
    $(".snapSlot").droppable("option", "disabled", false);
}

function startOver()
{
    // Reset remaining piecs on rack.
    for(var index in ScrabbleTiles)
    {
        //numPiecesRemaining += ScrabbleTiles[index]["number-remaining"];
        ScrabbleTiles[index]["number-remaining"] = ScrabbleTiles[index]["original-distribution"];
    }

    // Reset pieces.
    drawAllPieces();

    // Reset total score.
    $("span#totalScore").html("0");
}