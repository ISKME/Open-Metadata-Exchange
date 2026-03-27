// @ts-nocheck
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Grid, Paper, GlobalStyles, MenuItem, MenuList, ListItemText } from '@mui/material'
import styles from './Reports.styles'
import { ReportsCaseAnalytics } from 'widgets/ReportsCaseAnalytics'
import { ReportsCaseDetails } from 'widgets/ReportsCaseDetails'
import { ReportsTaggingUser } from 'widgets/ReportsTaggingUser'
import { ReportsUserAnalytics } from 'widgets/ReportsUserAnalytics'

export function Reports() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedMenu, setSelectedMenu] = useState(Number(searchParams.get('menu')) || 0)

  const handleMenuClick = (index) => {
    setSelectedMenu(index)
    setSearchParams({ menu: index })
  }

  const menuItems = [
    { name: 'Case Analytics', component: ReportsCaseAnalytics, data: { id: 'test' } },
    { name: 'Case Details', component: ReportsCaseDetails, data: {} },
    { name: 'Tagging User', component: ReportsTaggingUser, data: {} },
    { name: 'User Analytics', component: ReportsUserAnalytics, data: {} },
  ]

  const SelectedComponent = menuItems[selectedMenu].component
  const selectedData = menuItems[selectedMenu].data

  return (
    <Box sx={styles.box}>
      <GlobalStyles styles={styles.global} />
      <Grid container spacing={2} sx={styles.container}>
        <Grid item xs={3}>
          <Paper elevation={0} sx={styles.paper}>
            <MenuList>
              {menuItems.map((item, index) => (
                <MenuItem
                  onClick={() => handleMenuClick(index)}
                  key={item.name}
                  sx={styles.menu(index, selectedMenu)}
                >
                  <ListItemText sx={styles.item(index, selectedMenu)}>
                    {item.name}
                  </ListItemText>
                </MenuItem>
              ))}
            </MenuList>
          </Paper>
        </Grid>
        <Grid item xs={9}>
          <SelectedComponent {...selectedData} />
        </Grid>
      </Grid>
    </Box>
  );
}
