import * as React from "react";
import * as Select from "@radix-ui/react-select";
import {  Button, Card, Flex, TextField } from "@radix-ui/themes";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Form } from "radix-ui";
import "./BookingForm.css"; // Import styles

const BookingForm = () => {
  const [selectedDate, setSelectedDate] = React.useState("04/01/2021");
  const [selectedTime, setSelectedTime] = React.useState("06:30 PM");
  const [email, setEmail] = React.useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert(`Booking confirmed!\nDate: ${selectedDate}\nTime: ${selectedTime}\nEmail: ${email}`);
  };

  return (
    <>
    <h2 className="booking-title">Book A Table</h2>
    <Card className="booking-card">
      <Form.Root onSubmit={handleSubmit}>
        <Flex direction="row" gap="8">
         

          {/* Date Selector */}
          <Form.Field name="date">
            <label>Date</label>
            <Form.Control asChild>
              <Select.Root value={selectedDate} onValueChange={setSelectedDate}>
                <Select.Trigger className="select-trigger">
                  <Select.Value />
                  <Select.Icon className="select-icon">
                    <ChevronDownIcon />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="select-content">
                    <Select.Viewport className="select-viewport">
                      {["04/01/2021", "05/01/2021"].map((date) => (
                        <Select.Item key={date} className="select-item" value={date}>
                          <Select.ItemText>{date}</Select.ItemText>
                          <Select.ItemIndicator>
                            <CheckIcon />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </Form.Control>
          </Form.Field>

          {/* Time Selector */}
          <Form.Field name="time">
            <label>Time</label>
            <Form.Control asChild>
              <Select.Root value={selectedTime} onValueChange={setSelectedTime}>
                <Select.Trigger className="select-trigger">
                  <Select.Value />
                  <Select.Icon className="select-icon">
                    <ChevronDownIcon />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="select-content">
                    <Select.Viewport className="select-viewport">
                      {["06:30 PM", "07:00 PM"].map((time) => (
                        <Select.Item key={time} className="select-item" value={time}>
                          <Select.ItemText>{time}</Select.ItemText>
                          <Select.ItemIndicator>
                            <CheckIcon />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </Form.Control>
          </Form.Field>

          {/* Email Input */}
          <Form.Field name="email">
            <label>Email</label>
            <Form.Control asChild>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Control>
          </Form.Field>

          {/* Submit Button */}
          <Form.Submit asChild>
            <Button className="book-table-btn">Book a Table</Button>
          </Form.Submit>
        </Flex>
      </Form.Root>
    </Card>
    </>
  );
};

export default BookingForm;
