class Calculator {
    // Hàm khởi tạo, nhận 2 phần tử HTML để hiển thị
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear(); // Luôn reset máy tính khi vừa tải xong
    }

    // 1. XÓA SẠCH (Nút AC)
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    // 2. XÓA KÝ TỰ (Nút Del)
    delete() {
        // Nếu số hiện tại chỉ còn 1 chữ số, reset nó về '0'
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            // Nếu không, cắt bỏ ký tự cuối cùng
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    // 3. THÊM SỐ (Nút 0-9)
    appendNumber(number) {
        // ĐIỀU KIỆN: Nếu số hiện tại là '0', hãy thay thế nó
        if (this.currentOperand === '0') {
            this.currentOperand = number;
        } else {
            // Nếu không, nối thêm vào
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    // 4. THÊM DẤU PHẨY (Nút ,)
    appendDecimal() {
        // ĐIỀU KIỆN: Chỉ thêm dấu ',' nếu chưa có
        if (this.currentOperand.includes(',')) return;
        this.currentOperand = this.currentOperand.toString() + ',';
    }

    // 5. CHỌN PHÉP TÍNH (Nút +, -, ×, ÷)
    chooseOperation(operation) {
        // Nếu chưa nhập số mà bấm phép tính, không làm gì cả
        if (this.currentOperand === '0' && this.previousOperand === '') return;
        
        // Nếu đã có số và phép tính trước đó, thực hiện phép tính cũ
        if (this.previousOperand !== '') {
            this.compute();
        }
        
        // Di chuyển số hiện tại lên trên và lưu phép tính
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0'; // Reset để nhập số mới
    }

    // 6. TÍNH TOÁN KẾT QUẢ (Nút =)
    compute() {
        let computation;
        // Chuyển chuỗi có dấu ',' sang số (thay ',' bằng '.')
        const prev = parseFloat(this.previousOperand.replace(',', '.'));
        const current = parseFloat(this.currentOperand.replace(',', '.'));
        
        // ĐIỀU KIỆN: Nếu 1 trong 2 số không hợp lệ, không tính
        if (isNaN(prev) || isNaN(current)) return;
        
        // ĐIỀU KIỆN (switch...case) để chọn phép tính
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                // ĐIỀU KIỆN: Xử lý chia cho 0
                if (current === 0) {
                    alert("Không thể chia cho 0!");
                    this.clear();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Cập nhật kết quả và reset
        // Chuyển kết quả về dạng chuỗi và đổi '.' thành ','
        this.currentOperand = computation.toString().replace('.', ','); 
        this.operation = undefined;
        this.previousOperand = '';
    }

    // 7. XỬ LÝ NÚT % (Phần trăm)
    handlePercent() {
        if (this.currentOperand === '0') return;
        const current = parseFloat(this.currentOperand.replace(',', '.'));
        this.currentOperand = (current / 100).toString().replace('.', ',');
    }

    // 8. CẬP NHẬT HIỂN THỊ (Hàm nội bộ)
    updateDisplay() {
        this.currentOperandTextElement.innerText = this.currentOperand;
        if (this.operation != null) {
            // Hiển thị phép tính ở dòng trên
            this.previousOperandTextElement.innerText = 
                `${this.previousOperand} ${this.operation}`;
        } else {
            // Xóa dòng trên nếu không có phép tính
            this.previousOperandTextElement.innerText = '';
        }
    }
}


/* --- KẾT NỐI LOGIC VỚI HTML (Sự kiện) --- */

// 1. Chọn tất cả các phần tử HTML cần dùng
const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const equalsButton = document.querySelector('[data-equals]');
const allClearButton = document.querySelector('[data-all-clear]');
const deleteButton = document.querySelector('[data-delete]'); // Nút "Del"
const decimalButton = document.querySelector('[data-decimal]');
const percentButton = document.querySelector('[data-percent]');
const previousOperandTextElement = document.querySelector('.previous-operand');
const currentOperandTextElement = document.querySelector('.current-operand');
const themeToggleButton = document.getElementById('theme-toggle');

// 2. Tạo một đối tượng (instance) từ "bản thiết kế" Calculator
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// 3. Gắn sự kiện "click" cho từng loại nút

// Nút số (NHẬP dữ liệu)
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

// Nút phép tính
operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    });
});

// Nút Bằng (=)
equalsButton.addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
});

// Nút AC (Xóa tất cả)
allClearButton.addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

// Nút Del (Xóa 1 ký tự)
// (Giả sử bạn đặt data-delete cho nút 'Del' trong HTML)
deleteButton.addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
});

// Nút dấu phẩy (,)
decimalButton.addEventListener('click', () => {
    calculator.appendDecimal();
    calculator.updateDisplay();
});

// Nút phần trăm (%)
percentButton.addEventListener('click', () => {
    calculator.handlePercent();
    calculator.updateDisplay();
});

// Nút đổi Giao diện (Theme)
themeToggleButton.addEventListener('click', () => {
    // Dùng classList.toggle để thêm/xóa class 'dark-theme' khỏi thẻ <body>
    document.body.classList.toggle('dark-theme');
});