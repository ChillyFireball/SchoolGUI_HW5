LINK: https://chillyfireball.github.io/SchoolGUI_HW5/

WRITE-UP

Implemented Features:

-Letter tiles are randomly drawn from the Scrabble_Pieces_Associative_Array_Jessue structure.
(Still some weird behavior when running out of tiles; see Known Issues below for details.)

-Letter tiles can be dragged and dropped onto target squares; the board line is a background
image with internal divs (.snapSlot) that act as targets for the dropped tiles. Upon dropping
the tiles, the draggable tile is deleted entirely, and a non-draggable imag with the same
image source as the draggable tile is placed inside the target div. After this, droppability
in the target div is disabled to prevent overlap.

-Upon dropping the tile, the program gets the letter information from the data-letter attribute,
which is set upon generation of the draggable piece. It adds this letter to a global array
(piecesOnBoard) that stores the letter value of the pieces on the board, and uses it as a key
to check the ScrabbleTiles array for the letter's point value.

-Board includes bonus squares; bonuses are stored in the data-wordMultiplier and
data-LetterMultiplier attributes of the board slot divs (.snapSlot). When a letter is dropped
into a snapSlot, it checks that slot's multiplier attributes when setting the score.

-Score appears to be tallied correctly based on testing.

-The player can keep submitting more and more words until all tiles are depleted, though there
ARE issues with tile depletion (see Known Issues below).

-The board is cleared upon clicking the Give Up or Submit buttons (all img.boardLetter elements
are deleted).

-After submitting a word, the rack is refilled with (7 - piecesOnRack.length) tiles.

-After submitting a word, the Word Score is added to Total Score, which is maintained across
multiple rounds until the player clicks Give Up.

-If a tile is dropped outside a valid droppable area, it reverts to its original position.

-Tiles cannot be moved once placed (because the tiles on the board are just non-draggable
images with the same image source as the draggable one).

-After the first letter is placed, the only valid droppable areas are the ones on the leftmost
and rightmost ends of the word.

-The New Game button can be used to restart the game; Total Score and tiles remaining are reset,
and new pieces are drawn.

Known Issues:

-If one attempts to draw tiles while there are no more to draw, the game
will still select two more random tiles.