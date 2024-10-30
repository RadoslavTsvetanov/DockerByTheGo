import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Define cost rates
request_cost_rate = 0.01  # Cost per request
storage_cost_rate = 0.05  # Cost per GB

# Generate range for requests and storage
requests = np.linspace(1, 1000, 100)  # Number of requests
storage = np.linspace(1, 500, 100)    # Storage occupied in GB

# Create mesh grid for requests and storage
requests_grid, storage_grid = np.meshgrid(requests, storage)

# Calculate cost for each combination
cost = (requests_grid * request_cost_rate) + (storage_grid * storage_cost_rate)

# Plotting the 3D surface
fig = plt.figure(figsize=(10, 7))
ax = fig.add_subplot(111, projection='3d')
surf = ax.plot_surface(requests_grid, storage_grid, cost, cmap='viridis', edgecolor='none')

# Label axes
ax.set_xlabel('Requests')
ax.set_ylabel('Storage (GB)')
ax.set_zlabel('Cost ($)')
ax.set_title('Cost per Request and Storage Occupied')

# Add color bar for reference
fig.colorbar(surf, ax=ax, shrink=0.5, aspect=5)

plt.show()
