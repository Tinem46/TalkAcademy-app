import * as Yup from 'yup';

export const LoginSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu quá dài')
    .required('Vui lòng nhập mật khẩu'),
  username: Yup.string()
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(30, 'Tên đăng nhập quá dài')
    .required('Vui lòng nhập tên đăng nhập'),
});
export const RequestPasswordSchema = Yup.object().shape({

  email: Yup.string()
    .email('Invalid email')
    .required('Không được để trống'),
});
export const ChangePassSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Bắt buộc"),
  newPassword: Yup.string().min(6, "Tối thiểu 6 ký tự").required("Bắt buộc"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Mật khẩu không khớp")
    .required("Bắt buộc"),
});
export const ForgotPasswordSchema = Yup.object().shape({
  code: Yup.string().required("Bắt buộc"),
  newPassword: Yup.string().min(6, "Tối thiểu 6 ký tự").required("Bắt buộc"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Mật khẩu không khớp")
    .required("Bắt buộc"),
});

export const RegisterSchema = Yup.object().shape({
  email: Yup.string()
    .email("Email không hợp lệ")
    .required("Không được để trống"),

  firstName: Yup.string()
    .min(2, "Tên quá ngắn")
    .max(50, "Tên quá dài")
    .required("Không được để trống"),
  lastName: Yup.string()
    .min(1, "Họ quá ngắn")
    .max(50, "Họ quá dài")
    .required("Không được để trống"),

  password: Yup.string()
    .min(2, "Mật khẩu quá ngắn")
    .max(50, "Mật khẩu quá dài")
    .required("Không được để trống"),

  gender: Yup.boolean()
    .required("Không được để trống"),
});
export const UpdateUserSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('Vui lòng nhập tên!'),
  lastName: Yup.string()
    .required('Vui lòng nhập họ!'),
  gender: Yup.string()
    .oneOf(["male", "female", "other"], "Giới tính không hợp lệ!")
    .required('Vui lòng chọn giới tính!'),
});
