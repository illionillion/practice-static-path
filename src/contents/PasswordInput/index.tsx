import { Button, Input, InputGroup, InputRightElement, useBoolean } from "@yamada-ui/react";
import { FC } from "react";

const PasswordInput: FC = () => {
    const [show, {
        toggle
    }] = useBoolean();
    return <InputGroup size="md">
        <Input pr="4.5rem" type={show ? "text" : "password"} placeholder="your password" />
        <InputRightElement w="4.5rem" isClick>
            <Button h="1.75rem" size="sm" onClick={toggle}>
                {show ? "Hide" : "Show"}
            </Button>
        </InputRightElement>
    </InputGroup>
}

export default PasswordInput

export const metadata = {
    "title": "Password Input",
    "category": "inputs",
    "canvas": {
        "center": true,
        "maxWidth": 420
    }
};
