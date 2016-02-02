(function($){
    var methods = {
            init : function(options) {
                initializeBoard.apply(this, arguments);
                playIntro();
            },
            reset : function() {
                initializeBoard.apply(this, arguments);
                $playerTurnParentElem.children()
                    .hide()
                    .siblings("div[class='player-"+nextTurn+"']")
                    .fadeIn();
            },
            quit: function() {
                var o = this;
                $boardElem.hide();
                $playerTurnParentElem.children().hide();
                $goodbyeMessageElem.fadeIn("slow")
                    .delay(3000)
                    .fadeOut("slow", function(){
                        initializeBoard.apply(o, arguments);
                        initializeGameMenu();
                    });

            }
        };
        nextTurn = 1,
        boardArray = [],
        $boardRowCollection = null,
        $boardElem = null,
        $winningFours = null,
        $openCellCollection = null,
        humanMode = true,
        gameEnded = false,
        $gameMenuElem = null,
        $levelMenuElem = null,
        $playerTurnParentElem = null,
        $goodluckMessageElem = null,
        $goodbyeMessageElem = null,
        $mainMenuModal = null,
        $gameResultElem = null;

    $.fn.powerofthefours = function(methodOrOptions) {
        if (methods[methodOrOptions]) {
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || ! methodOrOptions) {
            // Default to "init"
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +methodOrOptions+ ' does not exist on jQuery.tooltip');
        }
    };

    function initializeBoard() {
        var rowElemMarkup = [],
            colElemMarkup = [];

        _this = this;
        $boardElem = $(this);
        nextTurn = 1;
        boardArray.length = 0;
        $winningFours = null;
        gameEnded = false;

        $gameMenuElem = $("#game-menu");
		$levelMenuElem = $("#level-menu");
		$playerTurnParentElem = $("#player-turn-container");
		$goodluckMessageElem = $("#goodluck");
		$goodbyeMessageElem = $("#goodbye");
		$mainMenuModal = $("#main-menu");
        $gameResultElem = $("#result-container");

        for(a=0; a<6; a++){
            boardArray.push([0,0,0,0,0,0,0]);
        }

        if ($boardRowCollection) $boardRowCollection.remove();
        showResult("none", 0);

        for(a=0; a<6; a++) {
            rowElemMarkup.length = 0;
            rowElemMarkup.push('<div class="board-row">');
            colElemMarkup.length = 0;
            for(b=0; b<7; b++) {
                colElemMarkup.push('<div class="board-cell"><a data-player="" data-row="'+a+'" data-col="'+b+'"><span></span></a></div>');
            }
            rowElemMarkup.push(colElemMarkup.join(""));
            rowElemMarkup.push('</div>');
            $boardElem.append(rowElemMarkup.join(""));
        }

        $boardRowCollection = $(".board-row");
        $openCellCollection = $("a:not('.occupied')", $boardRowCollection);

        $boardElem.off("click")
            .on("click", ".board-row a", function(e){
                e.preventDefault();

                fromAi = e.originalEvent ? false : true;

                if (gameEnded || $(this).hasClass("occupied") || (nextTurn != 1 && !humanMode && !fromAi)) {
                    return;
                }

                $(this).off("click");
                markCell(fromAi, $(this).data("row"), $(this).data("col"), $(this).data("player"));
            })
            .one("click", ".reset-game", function(e){
                e.preventDefault();
                $mainMenuModal.modal('hide');
                _this.powerofthefours("reset");
            })
            .one("click", ".quit-to-menu", function(e){
                e.preventDefault();
                $mainMenuModal.modal('hide');
                _this.powerofthefours("quit");
            });
    }

    function markCell(isAi, row, col, playerNum) {
        for (a=5; a>=0; a--) {
            if (boardArray[a][col] === 0) {
                boardArray[a][col] = nextTurn;
                $boardRowCollection.eq(a).find("a").eq(col)
                    .attr("data-player", nextTurn).addClass("occupied");
                $openCellCollection = $("a:not('.occupied')", $boardRowCollection);

                if(checkIfWinner(a, col)) {
                    // winning fours found; display result
                    gameEnded = true;
                    $boardRowCollection.addClass("game-end");
                    $.each($winningFours, function(index, item) {
                        item.addClass("winning-cells");
                    });
                    showResult("win", nextTurn);
                } else {
                    if ($openCellCollection.length == 0) {
                        gameEnded = true; // no more available cells; game ends in a draw
                        showResult("draw", 0);
                    } else {
                        nextTurn = nextTurn == 1 ? (humanMode ? 2 : 3) : 1;
                        $playerTurnParentElem.children()
                            .hide()
                            .siblings("div[class='player-"+nextTurn+"']")
                            .fadeIn();

                        if (!humanMode && !isAi) {
                            // delay call to simulate thinking...not actually thinking...just random moves
                            setTimeout(makeAIMove, 2000);
                        }
                    }
                }

                break;
            }
        }
    }

    function makeAIMove() {
        // No actual heuristics here yet. Just randomizing from collection of available board cells.
        var randomColumn = Math.floor(Math.random() * $openCellCollection.length) + 0;

        $openCellCollection.eq(randomColumn).trigger("click");
    }

    function showResult(result, player) {
        $gameResultElem.attr({"data-result": result, "data-player": player});
    }

    function playIntro() {
        var transitionEvents = "transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd";
        var audio = $("#star-wars-sound-clip")[0];
        audio.play();

        $("#intro").addClass("reveal").one(transitionEvents, function() {
            $(".power-of-fours-title").addClass("reveal").one(transitionEvents, function() {
                $("#intro").addClass("hideup").one(transitionEvents, function() {
                    $(".stars").addClass("move-up");
                    $(this).delay(1500).fadeOut();
                    initializeGameMenu();
                });
            });
        });
    }

    function initializeGameMenu() {
        $gameMenuElem.delay(2000)
            .fadeIn()
            .off("click")
            .on("click", "a", function(e){
                e.preventDefault();

                var o = this;
                $gameMenuElem.fadeOut(function(){
                    if ($(o).hasClass("human")) {
                        $goodluckMessageElem.fadeIn()
                            .delay(3000)
                            .fadeOut(function(){
                                $boardElem.fadeIn();
                                $playerTurnParentElem.children()
                                    .hide()
                                    .siblings("div[class='player-"+nextTurn+"']")
                                    .fadeIn();
                                humanMode = true;
                            });
                    } else {
                        initializeLevelMenu();
                    }
                });
            });
    }

    function initializeLevelMenu() {
        $levelMenuElem.fadeIn()
            .off("click")
            .on("click", "a:not('.back-to-game-menu')", function(e){
                e.preventDefault();

                $(this).siblings().removeClass("popover-shown");

                switch ($(this).data("level")) {
                    case "pfft":
                        $levelMenuElem.fadeOut(function(){
                            $goodluckMessageElem.fadeIn()
                                .delay(3000)
                                .fadeOut(function(){
                                    $boardElem.fadeIn();
                                    $playerTurnParentElem.children()
                                        .hide()
                                        .siblings("div[class='player-"+nextTurn+"']")
                                        .fadeIn();
                                    humanMode = false;
                                });
                        });
                        break;
                    case "jedi":
                    case "tyrant":
                        $(this).toggleClass("popover-shown");
                        break;
                }
            })
            .on("click", ".back-to-game-menu", function(e) {
                e.preventDefault();

                $(this).siblings().removeClass("popover-shown");
                $levelMenuElem.fadeOut(function(){
                    $gameMenuElem.fadeIn();
                });
            });
    }

    function checkIfWinner(currentRow, currentCol) {
        var verticalFours = checkVerticalFours(),
            horizontalFours = checkHorizontalFours(),
            diagonalFours = checkDiagonalFours();

        $winningFours = verticalFours.elems || horizontalFours.elems || diagonalFours.elems;
        return verticalFours.hasFours || horizontalFours.hasFours || diagonalFours.hasFours;

        // From the current cell position, check 3 places up and 3 places down in the same column
        function checkVerticalFours() {
            var connectCount = 1,
                continueUp = true,
                continueDown = true,
                result = {
                    hasFours: false,
                    elems: []
                };

            result.elems.push($boardRowCollection.eq(currentRow).find(".board-cell:eq("+currentCol+")"));

            for (a=1; a<4; a++) {
                if ((currentRow-a)>=0 && continueUp) {
                    if (connectCount < 4
                        && boardArray[currentRow-a][currentCol] != 0
                        && boardArray[currentRow-a][currentCol] == boardArray[currentRow][currentCol]) {
                        connectCount++;
                        result.elems.push($boardRowCollection.eq((currentRow-a)).find(".board-cell:eq("+currentCol+")"));
                    } else {
                        continueUp = false;
                    }
                }

                if ((currentRow+a)<6 && continueDown) {
                    if (connectCount < 4
                        && boardArray[currentRow+a][currentCol] != 0
                        && boardArray[currentRow+a][currentCol] == boardArray[currentRow][currentCol]) {
                        connectCount++;
                        result.elems.push($boardRowCollection.eq((currentRow+a)).find(".board-cell:eq("+currentCol+")"));
                    } else {
                        continueDown = false;
                    }
                }

                if (connectCount == 4) {
                    result.hasFours = true;
                    return result;
                }
            }
            result.elems = null;
            return result;
        }

        // From the current cell position, check 3 places left and 3 places right in the same row
        function checkHorizontalFours() {
            var connectCount = 1,
                continueLeft = true,
                continueRight = true,
                result = {
                    hasFours: false,
                    elems: []
                };

            result.elems.push($boardRowCollection.eq(currentRow).find(".board-cell:eq("+currentCol+")"));

            for (a=1; a<4; a++) {
                if ((currentCol-a)>=0 && continueLeft == true) {
                    if (connectCount < 4
                        && boardArray[currentRow][currentCol-a] != 0
                        && boardArray[currentRow][currentCol-a] == boardArray[currentRow][currentCol]) {
                        connectCount++;
                        result.elems.push($boardRowCollection.eq(currentRow).find(".board-cell:eq("+(currentCol-a)+")"));
                    } else {
                        continueLeft = false;
                    }
                }

                if ((currentCol+a)<7 && continueRight == true) {
                    if (connectCount < 4
                        && boardArray[currentRow][currentCol+a] != 0
                        && boardArray[currentRow][currentCol+a] == boardArray[currentRow][currentCol]) {
                        connectCount++;
                        result.elems.push($boardRowCollection.eq(currentRow).find(".board-cell:eq("+(currentCol+a)+")"));
                    } else {
                        continueRight = false;
                    }
                }

                if (connectCount == 4) {
                    result.hasFours = true;
                    return result;
                }
            }
            result.elems = null;
            return result;
        }

        // From the current cell position, check 3 places to NW, NE, SE and SW directions
        function checkDiagonalFours() {
            var connectCount = 1,
                continueLeft = true,
                continueRight = true,
                result = {
                    hasFours: false,
                    elems: []
                };

            result.elems.push($boardRowCollection.eq(currentRow).find(".board-cell:eq("+currentCol+")"));

            for (a=1; a<4; a++) {
                if ((currentRow-a)>=0 && (currentCol-a)>=0 && continueLeft) {
                    if (connectCount < 4
                        && boardArray[currentRow-a][currentCol-a] != 0
                        && boardArray[currentRow-a][currentCol-a] == boardArray[currentRow][currentCol]) {
                        connectCount++;
                        result.elems.push($boardRowCollection.eq((currentRow-a)).find(".board-cell:eq("+(currentCol-a)+")"));
                    } else {
                        continueLeft = false;
                    }
                }
                if ((currentRow+a)<6 && (currentCol+a)<7 && continueRight) {
                    if (connectCount < 4
                        && boardArray[currentRow+a][currentCol+a] != 0
                        && boardArray[currentRow+a][currentCol+a] == boardArray[currentRow][currentCol]) {
                        connectCount++;
                        result.elems.push($boardRowCollection.eq((currentRow+a)).find(".board-cell:eq("+(currentCol+a)+")"));
                    } else {
                        continueRight = false;
                    }
                }

                if (connectCount == 4) {
                    result.hasFours = true;
                    return result;
                }
            }

            connectCount = 1;
            continueLeft = true;
            continueRight = true;
            result.elems.length = 0;
            result.elems.push($boardRowCollection.eq(currentRow).find(".board-cell:eq("+currentCol+")"));

            for (a=1; a<4; a++) {
                if ((currentRow-a)>=0 && (currentCol+a)<7 && continueRight) {
                    if (connectCount < 4
                        && boardArray[currentRow-a][currentCol+a] != 0
                        && boardArray[currentRow-a][currentCol+a] == boardArray[currentRow][currentCol]) {
                        connectCount++;
                        result.elems.push($boardRowCollection.eq((currentRow-a)).find(".board-cell:eq("+(currentCol+a)+")"));
                    } else {
                        continueRight = false;
                    }
                }
                if ((currentRow+a)<6 && (currentCol-a)>=0 && continueLeft) {
                    if (connectCount < 4
                        && boardArray[currentRow+a][currentCol-a] != 0
                        && boardArray[currentRow+a][currentCol-a] == boardArray[currentRow][currentCol]) {
                        connectCount++;
                        result.elems.push($boardRowCollection.eq((currentRow+a)).find(".board-cell:eq("+(currentCol-a)+")"));
                    } else {
                        continueLeft = false;
                    }
                }
                if (connectCount == 4) {
                    result.hasFours = true;
                    return result;
                }
            }

            result.elems = null;
            return result;
        }
    }
})( jQuery );