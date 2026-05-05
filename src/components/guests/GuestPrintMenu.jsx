import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Printer, Tag, ChevronDown, FileText } from "lucide-react";
import NameTagPrint from "./NameTagPrint";
import BulkPrintExport from "../invitations/BulkPrintExport";

export default function GuestPrintMenu({ guests, invitations }) {
  const [nameTagOpen, setNameTagOpen] = useState(false);
  const [bulkPrintOpen, setBulkPrintOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            Print
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Print Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setNameTagOpen(true)} className="gap-2 cursor-pointer">
            <Tag className="w-4 h-4 text-accent" />
            Name Tags
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBulkPrintOpen(true)} className="gap-2 cursor-pointer">
            <FileText className="w-4 h-4 text-accent" />
            Invitation Documents
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NameTagPrint open={nameTagOpen} onOpenChange={setNameTagOpen} guests={guests} />
      <BulkPrintExport open={bulkPrintOpen} onOpenChange={setBulkPrintOpen} invitations={invitations} guests={guests} />
    </>
  );
}