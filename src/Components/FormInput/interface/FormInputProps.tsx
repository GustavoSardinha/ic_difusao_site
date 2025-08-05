interface FormInputProps {
  label: string;
  placeholder?: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}
export default FormInputProps;