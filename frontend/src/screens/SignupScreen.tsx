import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import {
  CheckboxGroupField,
  DateField,
  NumberField,
  SelectField,
  TextField,
} from "@/components/form-components/InputFields/InputFields";
import { useAppForm } from "@/config/use-app-form";
import { SignupFormSchema, type SignupFormValues, type SignupRequest } from "@/models/Signup";
import { useSignup } from "@/services/UserServices";

export const SignupScreen = () => {
  const { mutate, error } = useSignup();

  const formData = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      lastname: "",
      gender: "",
      birthDate: "",
      interests: [],
      budget: "",
      travelType: "",
      languages: "",
    } as SignupFormValues,
    validators: {
      onChange: SignupFormSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = toSignupRequest(value);
      mutate(payload);
    },
  });

  return (
    <CommonLayout>
      <h1>Sign Up</h1>
      <formData.AppForm>
        <formData.FormContainer extraError={error}>
          <formData.AppField name="email" children={(field) => <field.TextField label="Email" />} />
          <formData.AppField name="password" children={(field) => <field.PasswordField label="Password" />} />
          <formData.AppField name="name" children={() => <TextField label="Nombre" />} />
          <formData.AppField name="lastname" children={() => <TextField label="Apellido" />} />
          <formData.AppField
            name="gender"
            children={() => (
              <SelectField
                label="Genero"
                placeholder="Selecciona genero"
                options={[
                  { label: "Masculino", value: "Masculino" },
                  { label: "Femenino", value: "Femenino" },
                  { label: "Otro", value: "Otro" },
                ]}
              />
            )}
          />
          <formData.AppField name="birthDate" children={() => <DateField label="Fecha de nacimiento" />} />
          <formData.AppField
            name="interests"
            children={() => (
              <CheckboxGroupField
                label="Intereses (opcional)"
                options={[
                  { label: "Comida", value: "FOOD" },
                  { label: "Cultura", value: "CULTURE" },
                  { label: "Naturaleza", value: "NATURE" },
                ]}
              />
            )}
          />
          <formData.AppField name="budget" children={() => <NumberField label="Presupuesto (opcional)" />} />
          <formData.AppField
            name="travelType"
            children={() => (
              <SelectField
                label="Tipo de viaje (opcional)"
                placeholder="Selecciona tipo"
                options={[
                  { label: "Solo", value: "SOLO" },
                  { label: "Pareja", value: "PAREJA" },
                  { label: "Amigos", value: "AMIGOS" },
                ]}
              />
            )}
          />
          <formData.AppField name="languages" children={() => <TextField label="Idiomas (opcional)" />} />
        </formData.FormContainer>
      </formData.AppForm>
    </CommonLayout>
  );
};

const toSignupRequest = (value: SignupFormValues): SignupRequest => {
  const budget = value.budget?.trim();
  const parsedBudget = budget && !Number.isNaN(Number(budget)) ? Number(budget) : undefined;
  const languages = (value.languages ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return {
    email: value.email.trim(),
    password: value.password,
    name: value.name.trim(),
    lastname: value.lastname.trim(),
    gender: value.gender,
    birthDate: value.birthDate,
    interests: value.interests && value.interests.length > 0 ? value.interests : undefined,
    budget: parsedBudget,
    travelType: value.travelType && value.travelType.trim().length > 0 ? (value.travelType as SignupRequest["travelType"]) : undefined,
    languages: languages.length > 0 ? languages : undefined,
  };
};

