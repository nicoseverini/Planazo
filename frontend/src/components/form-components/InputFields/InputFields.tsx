import { useId } from "react";

import { ErrorContainer } from "@/components/form-components/ErrorContainer/ErrorContainer";
import { useFieldContext } from "@/config/form-context";

import styles from "./InputFields.module.css";

export const TextField = ({ label }: { label: string }) => {
  return <FieldWithType type="text" label={label} />;
};

export const PasswordField = ({ label }: { label: string }) => {
  return <FieldWithType type="password" label={label} />;
};

export const NumberField = ({ label }: { label: string }) => {
  return <FieldWithType type="number" label={label} />;
};

export const DateField = ({ label }: { label: string }) => {
  return <FieldWithType type="date" label={label} />;
};

export const SelectField = ({
  label,
  options,
  placeholder,
}: {
  label: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}) => {
  const id = useId();
  const field = useFieldContext<string>();
  return (
    <>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.dataContainer}>
        <select
          id={id}
          name={field.name}
          value={field.state.value}
          className={styles.input}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
        >
          <option value="">{placeholder ?? "Selecciona"}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ErrorContainer errors={field.state.meta.errors} />
      </div>
    </>
  );
};

export const CheckboxGroupField = ({
  label,
  options,
}: {
  label: string;
  options: { label: string; value: string }[];
}) => {
  const id = useId();
  const field = useFieldContext<string[]>();
  const selectedValues = Array.isArray(field.state.value) ? field.state.value : [];

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      field.handleChange(selectedValues.filter((item) => item !== value));
    } else {
      field.handleChange([...selectedValues, value]);
    }
  };

  return (
    <>
      <span id={id} className={styles.label}>
        {label}
      </span>
      <div className={styles.dataContainer}>
        <div className={styles.checkboxGroup} aria-labelledby={id}>
          {options.map((option) => (
            <label key={option.value} className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => toggleValue(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <ErrorContainer errors={field.state.meta.errors} />
      </div>
    </>
  );
};

const FieldWithType = ({ label, type }: { label: string; type: string }) => {
  const id = useId();
  const field = useFieldContext<string>();
  return (
    <>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.dataContainer}>
        <input
          id={id}
          name={field.name}
          value={field.state.value}
          className={styles.input}
          type={type}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
        />
        <ErrorContainer errors={field.state.meta.errors} />
      </div>
    </>
  );
};
