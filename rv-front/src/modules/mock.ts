import { type Command } from "./commandsApi";
import DefaultImage1 from "../assets/DefaultImage1.jpg";
import DefaultImage2 from "../assets/DefaultImage2.jpg";
import DefaultImage3 from "../assets/DefaultImage3.jpg";
import DefaultImage4 from "../assets/DefaultImage4.jpg";
import DefaultImage5 from "../assets/DefaultImage5.jpg";

export const COMMANDS_MOCK: Command[] =
  [
    {
      id: 1,
      is_delete: false,
      com_name: "Shift Right Logical Immediate",
      fmt: "rd, rs, imm",
      rs_num: 2,
      rd_num: 1,
      description: "Выполняет операцию побитового сдвига числа rs на imm позиции вправо, после чего число записывается в rd.",
      img: DefaultImage1
    },
    {
      id: 2,
      is_delete: false,
      com_name: "Shift Left Logical Immediate",
      fmt: "rd, rs, imm",
      rs_num: 2,
      rd_num: 1,
      description: "Выполняет операцию побитового сдвига числа rs на imm позиции влево, после чего число записывается в rd.",
      img: DefaultImage2
    },
    {
      id: 3,
      is_delete: false,
      com_name: "SUBtract Immediate",
      fmt: "rd, rs, imm",
      rs_num: 1,
      rd_num: 2,
      description: "Из числа в rs вычитается imm, результат записывается в rd.",
      img: DefaultImage3
    },
    {
      id: 4,
      is_delete: false,
      com_name: "NOT",
      fmt: "rd, rs",
      rs_num: 1,
      rd_num: 2,
      description: "Биты числа в rs инвертируются, результат записывается в rd.",
      img: DefaultImage4
    },
    {
      id: 5,
      is_delete: false,
      com_name: "AND Immediate",
      fmt: "rd, rs, imm",
      rs_num: 1,
      rd_num: 2,
      description: "Побитово производится операция И над числами rs и imm, результат записывается в rd.",
      img: DefaultImage5
    },
  ];