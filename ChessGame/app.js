// Chờ cho toàn bộ trang web (HTML) được tải xong
document.addEventListener('DOMContentLoaded', () => {

    // 1. DỮ LIỆU
    
    const pieces = {
        'r': 'fa-solid fa-chess-rook',
        'n': 'fa-solid fa-chess-knight',
        'b': 'fa-solid fa-chess-bishop',
        'q': 'fa-solid fa-chess-queen',
        'k': 'fa-solid fa-chess-king',
        'p': 'fa-solid fa-chess-pawn',
        'R': 'fa-regular fa-chess-rook',
        'N': 'fa-regular fa-chess-knight',
        'B': 'fa-regular fa-chess-bishop',
        'Q': 'fa-regular fa-chess-queen',
        'K': 'fa-regular fa-chess-king',
        'P': 'fa-regular fa-chess-pawn'
    };

    const initialBoardState = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];

    // --- CÁC BIẾN "TRẠNG THÁI" MỚI ---
    
    // Tạo một bản sao SÂU (deep copy) của mảng ban đầu
    // Mảng này sẽ thay đổi khi chúng ta di chuyển
    let currentBoardState = initialBoardState.map(row => [...row]); 
    
    let selectedSquare = null;      // Ô DOM element đang chọn
    let selectedPiece = null;       // Ký tự quân cờ (ví dụ: 'P')
    let sourceSquareCoords = null;  // Tọa độ {row, col} của quân đang chọn
    let currentPlayer = 'white-piece';    // Bắt đầu với quân Trắng

    let isWhiteSoundOne = true; // Biến để luân phiên âm thanh
    let isBlackSoundOne = true;

    const boardElement = document.getElementById('chessboard');

    const captureSound = document.getElementById('capture-sound');

    // Thêm 4 dòng này:
    const whiteTurn1Sound = document.getElementById('white-turn-1-sound');
    const whiteTurn2Sound = document.getElementById('white-turn-2-sound');
    const blackTurn1Sound = document.getElementById('black-turn-1-sound');
    const blackTurn2Sound = document.getElementById('black-turn-2-sound');

    // 2. HÀM VẼ BÀN CỜ (NÂNG CẤP)
    
    function createBoard() {
        // Xóa bàn cờ cũ (nếu có) để vẽ lại
        boardElement.innerHTML = ''; 
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                
                const square = document.createElement('div');
                square.classList.add('square');

                const isLight = (row + col) % 2 !== 0;
                square.classList.add(isLight ? 'light-square' : 'dark-square');

                // Gán tọa độ cho ô để dễ debug
                square.dataset.row = row;
                square.dataset.col = col;

                const pieceChar = currentBoardState[row][col]; // Lấy từ mảng trạng thái

                if (pieceChar) {
                    const pieceElement = document.createElement('i');
                    const iconClasses = pieces[pieceChar];
                    pieceElement.classList.add(...iconClasses.split(' '));
                    pieceElement.classList.add('piece');
                    pieceElement.classList.add(getPieceColor(pieceChar)); // 'white-piece' hoặc 'black-piece'
                    square.appendChild(pieceElement);
                }

                // --- PHẦN QUAN TRỌNG: THÊM SỰ KIỆN CLICK ---
                square.addEventListener('click', () => {
                    handleSquareClick(square, row, col);
                });

                boardElement.appendChild(square);
            }
        }
    }

    // 3. HÀM XỬ LÝ LOGIC CHÍNH
    
    function handleSquareClick(square, row, col) {
        const pieceChar = currentBoardState[row][col];

        if (selectedPiece === null) {
            // --- CHƯA CÓ GÌ ĐƯỢC CHỌN ---
            if (pieceChar) {
                const pieceColor = getPieceColor(pieceChar);
                
                // Kiểm tra xem có phải lượt của người chơi này không
                // (getPieceColor trả về 'white-piece'/'black-piece',
                // currentPlayer là 'white'/'black')
                if (pieceColor.includes(currentPlayer)) { 
                    
                    // --- ⭐ BẮT ĐẦU THÊM CODE RUNG (SHAKE) ⭐ ---
                    
                    // 1. Tìm chính icon quân cờ (thẻ <i>) bên trong ô
                    const pieceElement = square.querySelector('.piece');
                    
                    if (pieceElement) {
                        // 2. Thêm class 'shake' để kích hoạt animation
                        pieceElement.classList.add('shake');
                        
                        // 3. Xóa class sau khi animation kết thúc (400ms = 0.4s)
                        //    để nó có thể rung ở lần nhấp chuột tiếp theo.
                        setTimeout(() => {
                            pieceElement.classList.remove('shake');
                        }, 400); // 400ms phải khớp với thời gian animation trong CSS
                    }
                    
                    // --- ⭐ KẾT THÚC CODE RUNG (SHAKE) ⭐ ---

                    // (Đây là code cũ của bạn, giữ nguyên)
                    selectedPiece = pieceChar;
                    selectedSquare = square;
                    sourceSquareCoords = { row, col };
                    square.classList.add('selected'); // Thêm lớp highlight
                }
            }
        } else {
            // --- ĐÃ CHỌN MỘT QUÂN CỜ ---
            
            // Bỏ chọn nếu nhấp lại chính nó
            if (selectedSquare === square) {
                clearSelection();
                return;
            }

            // Kiểm tra xem có phải là một nước đi HỢP LỆ không
            const targetCoords = { row, col };
            if (isValidMove(selectedPiece, sourceSquareCoords, targetCoords)) {
                
                // Nước đi hợp lệ!
                movePiece(sourceSquareCoords, targetCoords);
                
                // Đổi lượt
                currentPlayer = (currentPlayer === 'white-piece') ? 'black-piece' : 'white-piece';
                
                // Vẽ lại bàn cờ với vị trí mới
                createBoard(); 
                
                // Xóa lựa chọn
                clearSelection();

            } else {
                // Nước đi KHÔNG hợp lệ
                // (Tùy chọn: có thể thêm âm thanh báo lỗi ở đây)
                
                // Bỏ chọn quân cờ cũ
                clearSelection();
            }
        }
    }

    // 4. CÁC HÀM TIỆN ÍCH (Helpers)

    function getPieceColor(pieceChar) {
        if (!pieceChar) return null;
        // Chữ hoa là Trắng, chữ thường là Đen
        
        return (pieceChar === pieceChar.toUpperCase()) ? 'white-piece' : 'black-piece';
    }

    function clearSelection() {
        if (selectedSquare) {
            selectedSquare.classList.remove('selected');
        }
        selectedPiece = null;
        selectedSquare = null;
        sourceSquareCoords = null;
    }

    // Hàm di chuyển VÀ phát âm thanh
    function movePiece(from, to) {
        // 1. Kiểm tra xem có phải ăn quân không (TRƯỚC KHI di chuyển)
        const capturedPieceChar = currentBoardState[to.row][to.col];
        const isCapture = capturedPieceChar !== '';
        
        // 2. Di chuyển quân cờ (logic cũ)
        const piece = currentBoardState[from.row][from.col];
        currentBoardState[from.row][from.col] = ''; 
        currentBoardState[to.row][to.col] = piece;
        
        // 3. Phát âm thanh
        if (isCapture) {
            captureSound.currentTime = 0;
            captureSound.play();
            
            // --- ⭐ BẮT ĐẦU THÊM MỚI ⭐ ---
            // Kiểm tra xem quân bị ăn có phải là Tướng không
            if (capturedPieceChar.toLowerCase() === 'k') {
                // Lấy tên người chiến thắng
                const winner = (currentPlayer === 'white-piece') ? 'White' : 'Black';
                // Gọi hàm kết thúc trò chơi
                showGameOver(`GAME OVER!\nThe ${winner} is winner!`);
                return; // Dừng hàm tại đây, không đổi lượt nữa
            }
            // --- ⭐ KẾT THÚC THÊM MỚI ⭐ ---

        } else {
            // (Code phát âm thanh di chuyển thường, giữ nguyên)
            if (currentPlayer === 'white-piece') {
                if (isWhiteSoundOne) {
                    whiteTurn1Sound.currentTime = 0;
                    whiteTurn1Sound.play();
                } else {
                    whiteTurn2Sound.currentTime = 0;
                    whiteTurn2Sound.play();
                }
                isWhiteSoundOne = !isWhiteSoundOne; 
            } else {
                if (isBlackSoundOne) {
                    blackTurn1Sound.currentTime = 0;
                    blackTurn1Sound.play();
                } else {
                    blackTurn2Sound.currentTime = 0;
                    blackTurn2Sound.play();
                }
                isBlackSoundOne = !isBlackSoundOne;
            }
        }
    }
    // 5. HÀM KIỂM TRA LUẬT CHƠI (Validation)
    
    function isValidMove(piece, from, to) {
        const targetPiece = currentBoardState[to.row][to.col];
        const pieceColor = getPieceColor(piece);
        const targetColor = getPieceColor(targetPiece);

        // Không thể ăn quân cùng màu
        if (targetColor && targetColor === pieceColor) {
            return false;
        }

        const pieceType = piece.toLowerCase();

        switch (pieceType) {
            case 'p': // Tốt (Pawn)
                return isValidPawnMove(pieceColor, from, to, targetPiece);
            case 'n': // Mã (Knight)
                return isValidKnightMove(from, to);
            case 'b': // Tượng (Bishop)
                return isValidBishopMove(from, to);
            case 'r': // Xe (Rook)
                return isValidRookMove(from, to);
            case 'q': // Hậu (Queen)
                // Hậu = (Xe + Tượng)
                return isValidRookMove(from, to) || isValidBishopMove(from, to);
            case 'k': // Vua (King)
                return isValidKingMove(from, to);
            default:
                return false;
        }
    }

    // --- CÁC HÀM KIỂM TRA CHO TỪNG QUÂN CỜ ---
    
    function isValidPawnMove(color, from, to, targetPiece) {
        const direction = (color === 'white-piece') ? -1 : 1; // Trắng đi lên (row giảm), Đen đi xuống (row tăng)
        const startRow = (color === 'white-piece') ? 6 : 1;
        const dRow = to.row - from.row;
        const dCol = to.col - from.col;

        // 1. Đi thẳng
        if (dCol === 0 && !targetPiece) {
            // Đi 1 ô
            if (dRow === direction) return true;
            // Đi 2 ô (nước đầu)
            if (dRow === 2 * direction && from.row === startRow && !currentBoardState[from.row + direction][from.col]) {
                return true;
            }
        }

        // 2. Ăn chéo
        if (Math.abs(dCol) === 1 && dRow === direction && targetPiece) {
            return true;
        }
        
        return false;
    }

    function isValidKnightMove(from, to) {
        const dRow = Math.abs(to.row - from.row);
        const dCol = Math.abs(to.col - from.col);
        // Mã luôn đi 2-1 hoặc 1-2
        return (dRow === 2 && dCol === 1) || (dRow === 1 && dCol === 2);
    }

    function isValidKingMove(from, to) {
        const dRow = Math.abs(to.row - from.row);
        const dCol = Math.abs(to.col - from.col);
        // Vua chỉ đi 1 ô
        return dRow <= 1 && dCol <= 1;
    }

    // Hàm kiểm tra đường đi có bị cản không (cho Xe, Tượng, Hậu)
    function isPathClear(from, to) {
        const dRow = Math.sign(to.row - from.row); // Hướng đi: -1, 0, 1
        const dCol = Math.sign(to.col - from.col); // Hướng đi: -1, 0, 1

        let r = from.row + dRow;
        let c = from.col + dCol;

        // Lặp qua từng ô trên đường đi (không tính ô cuối)
        while (r !== to.row || c !== to.col) {
            if (currentBoardState[r][c]) {
                return false; // Bị cản
            }
            r += dRow;
            c += dCol;
        }
        return true; // Đường đi thoáng
    }

    function isValidRookMove(from, to) {
        // Phải đi thẳng (hàng hoặc cột)
        if (from.row !== to.row && from.col !== to.col) {
            return false;
        }
        // Kiểm tra đường đi có bị cản không
        return isPathClear(from, to);
    }

    function isValidBishopMove(from, to) {
        // Phải đi chéo (hàng và cột cùng thay đổi)
        if (Math.abs(to.row - from.row) !== Math.abs(to.col - from.col)) {
            return false;
        }
        // Kiểm tra đường đi có bị cản không
        return isPathClear(from, to);
    }

    function resetGame() {
        // 1. Reset mảng logic về ban đầu
        //    (Lưu ý: Phải .map() để tạo bản sao mới)
        currentBoardState = initialBoardState.map(row => [...row]);
        
        // 2. Reset lượt chơi
        currentPlayer = 'white-piece';
        
        // 3. Reset biến âm thanh
        isWhiteSoundOne = true;
        isBlackSoundOne = true;
        
        // 4. Xóa lựa chọn (nếu có)
        clearSelection();
        
        // 5. Vẽ lại bàn cờ
        createBoard();
        
        console.log("Bàn cờ đã được tải lại.");
    }

    function showGameOver(message) {
        // Dùng setTimeout để âm thanh "ăn quân" kịp phát
        setTimeout(() => {
            
            // 1. Hiển thị thông báo
            //    (Code JavaScript sẽ dừng ở đây cho đến khi user nhấn OK)
            alert(message);
            
            // 2. Sau khi user nhấn OK, tải lại bàn cờ
            resetGame();

        }, 300); // Đợi 300ms cho âm thanh
    }
    
    // --- Bắt đầu chạy chương trình ---
    createBoard();

});