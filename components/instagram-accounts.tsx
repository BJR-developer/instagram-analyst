import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type InstagramAccount = {
  username: string;
  followers: number;
  growth24h: number;
  growth30d: number;
};

const mockAccounts: InstagramAccount[] = [
  {
    username: "account1",
    followers: 10000,
    growth24h: 123,
    growth30d: 1234,
  },
  // Add more mock accounts here
];

export function InstagramAccounts() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Instagram Accounts</h2>
        <Button>Add Account</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead className="text-right">Followers</TableHead>
            <TableHead className="text-right">24h Growth</TableHead>
            <TableHead className="text-right">30d Growth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockAccounts.map((account) => (
            <TableRow key={account.username}>
              <TableCell className="font-medium">{account.username}</TableCell>
              <TableCell className="text-right">{account.followers.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <span className={account.growth24h >= 0 ? "text-green-600" : "text-red-600"}>
                  {account.growth24h >= 0 ? "+" : ""}{account.growth24h}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className={account.growth30d >= 0 ? "text-green-600" : "text-red-600"}>
                  {account.growth30d >= 0 ? "+" : ""}{account.growth30d}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
