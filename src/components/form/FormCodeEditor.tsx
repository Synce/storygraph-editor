/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

'use client';

import {highlight, languages} from 'prismjs';
import {type ReactElement} from 'react';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import Editor from 'react-simple-code-editor';

import FormField, {type FormFieldProps} from './FormField';

import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-jsx';
import 'prismjs/themes/prism.css';

type FormCodeEditorProps<T extends FieldValues> = UseControllerProps<T> & {
  field?: Omit<FormFieldProps, 'children'>;
};

const FormCodeEditor = <T extends FieldValues>({
  field,
  ...props
}: FormCodeEditorProps<T>): ReactElement => {
  const {
    field: input,
    fieldState: {error},
  } = useController(props);

  return (
    <FormField {...field} error={error?.message}>
      <Editor
        className="rounded-md bg-white text-black "
        value={input.value ?? ''}
        onValueChange={code => input.onChange(code)}
        highlight={code => highlight(code, languages.jsx!, 'jsx')}
        padding={10}
        onBlur={() => {
          input.onBlur();
        }}
      />
    </FormField>
  );
};

export default FormCodeEditor;
