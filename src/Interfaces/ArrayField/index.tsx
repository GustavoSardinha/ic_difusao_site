interface ArrayField {
  key: string;
  label: string;
  placeholder: string;
  msgAlert: string;
  exAlert: string;
  value: string;
  setter: React.Dispatch<React.SetStateAction<string>>;
}

export default ArrayField;