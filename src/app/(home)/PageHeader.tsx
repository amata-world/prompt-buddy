import { useLLMChat } from "@/contexts/WebLLM";
import { Avatar, AvatarFallback, AvatarImage } from "@/design/base/avatar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/design/base/combobox";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/design/base/item";
import { type AIModel, AVAILABLE_AI_MODELS } from "../../models";

export const PageHeader = () => {
  const { currentModel, setModel } = useLLMChat();

  return (
    <header className="relative flex w-full flex-row items-center py-1">
      <div className="">
        <h1 className="text-end">Prompt Buddy</h1>
      </div>

      <div className="flex flex-1 flex-row justify-end">
        <Combobox
          items={AVAILABLE_AI_MODELS}
          itemToStringValue={(model: AIModel) => model.id}
          defaultInputValue={currentModel.id}
          onInputValueChange={(inputValue) => {
            const matchingModel = AVAILABLE_AI_MODELS.find(
              (model) => model.id === inputValue,
            );

            if (matchingModel) {
              setModel(matchingModel);
            }
          }}
        >
          <ComboboxInput placeholder="Pick a model..." className="w-sm" />
          <ComboboxContent>
            <ComboboxEmpty>No models found</ComboboxEmpty>
            <ComboboxList>
              {(model: AIModel) => (
                <ComboboxItem key={model.id} value={model.id}>
                  <Item size="xs">
                    <ItemMedia>
                      <Avatar>
                        <AvatarImage src={model.imageUrl} />
                        <AvatarFallback>
                          {model.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{model.displayName}</ItemTitle>
                      <ItemDescription>{model.id}</ItemDescription>
                    </ItemContent>
                  </Item>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </header>
  );
};
