import { BotForm } from "../../api";
import { FormGroup } from "../ui";

interface Props {
  data: Partial<BotForm>;
  onChange: (d: Partial<BotForm>) => void;
}

export default function StepIdentity({ data, onChange }: Props) {
  return (
    <FormGroup label="Nombre del bot">
      {(props) => (
        <input
          {...props}
          value={data.name ?? ""}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="Ej: Recepcionista, Vendedor..."
        />
      )}
    </FormGroup>
  );
}
