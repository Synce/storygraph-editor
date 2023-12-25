type FormErrorMessageProps = {
  error?: string;
};

const FormErrorMessage = ({error}: FormErrorMessageProps) => {
  return (
    <p className="bg-error-bg text-c2 text-error mt-1 border border-black/5 p-2.5 font-semibold">
      {error}
    </p>
  );
};

export default FormErrorMessage;
