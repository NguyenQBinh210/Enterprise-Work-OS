import {NextResponse} from "next/server";

// Mô phỏng Database (Ví dụ tạm thời)
const mockProjects = [
  { id: 1, name: "Thiết kế Website E-commerce", status: "In Progress" },
  { id: 2, name: "Nghiên cứu thị trường Q3", status: "Done" },
];

// Hàm GET: Xử lý request lấy danh sách dự án
export async function GET() {
  // Thực tế: Lấy từ Database (Ví dụ: const projects = await prisma.project.findMany())
  return NextResponse.json(mockProjects);
}

// Hàm POST: Xử lý request tạo dự án mới
export async function POST(request: Request) {
  try {
    const body = await request.json(); // Lấy dữ liệu gửi lên từ Frontend

    // Thực tế: Lưu vào Database (Ví dụ: await prisma.project.create({ data: body }))
    const newProject = {
      id: Math.floor(Math.random() * 1000),
      name: body.name,
      status: body.status || "Todo",
    };

    return NextResponse.json({ message: "Tạo dự án thành công", data: newProject }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
}
