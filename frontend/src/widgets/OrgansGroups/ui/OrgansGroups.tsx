import * as React from "react";
import Typography from "@mui/material/Typography";
import { TableEdit } from "widgets/TableEdit";
import axios from "axios";

export function OrgansGroups({ id }) {
  const [groups, setGroups] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const fetchGroups = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await axios.get(`/api/groups/v1/groups/org?organization=${id}`);
      const { results } = response.data;
      setGroups(results);
    } catch (error) {
      console.error("Error while getting groups:", error);
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    if (id) {
      fetchGroups();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "800px",
      }}
    >
      <Typography component="div" variant="h5">
        Groups
      </Typography>
      <TableEdit
        orgId={id}
        isGetLeaders={true}
        updatedLeadersCallback={fetchGroups}
        toolbar
        records={groups}
        headers={[
          {
            field: "title",
            headerName: "Name",
            width: 250,
            editable: true,
          },
          {
            field: "leaders",
            headerName: "Leaders",
            align: "left",
            headerAlign: "left",
            editable: true,
            width: 288,
          },
          {
            field: "members",
            headerName: "Members",
            type: "number",
            width: 80,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "cases",
            headerName: "Cases",
            type: "number",
            width: 80,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
        ]}
      />
    </div>
  );
}
