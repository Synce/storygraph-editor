import Ajv, {type AnySchema} from 'ajv';
import axios from 'axios';
import {useEffect, useState} from 'react';

const useValidateJSONSchema = (schemaUrl: string, data: object) => {
  const [validationResult, setValidationResult] = useState({
    valid: null,
    errors: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndValidate = async () => {
      try {
        setLoading(true);
        const response = await axios.get(schemaUrl);
        const schema = response.data as AnySchema;

        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const valid = validate(data);
        // @ts-expect-error error
        setValidationResult({valid, errors: validate.errors});
      } catch (err) {
        // @ts-expect-error error

        setError(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchAndValidate();
  }, [schemaUrl, data]);

  return {...validationResult, loading, error};
};

export default useValidateJSONSchema;
